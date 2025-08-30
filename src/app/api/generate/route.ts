/**
 * /api/generate - Core AI question answering API (Edge Runtime)
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/db/supabase-server'
import { getCurrentUser } from '@/lib/auth/auth'
import { getDefaultAIProvider } from '@/lib/ai'
import { getSmartAIRouter } from '@/lib/ai/smartRouter'
import { buildCompletePrompt } from '@/lib/ai/prompts'
import { normalize, detectLanguage } from '@/lib/parsing/normalize'
import { detectQuestionType } from '@/lib/parsing/detect'
import { extractOptions } from '@/lib/parsing/extract'
import { hashPrompt, createAnswerCacheKey } from '@/lib/parsing/hash'
import { answerCache } from '@/lib/cache'
import { 
  QuestionInputSchema, 
  validateAIResponse, 
  createSuccessResponse, 
  createErrorResponse,
  sanitizeAIResponse
} from '@/lib/ai/schema'
import { getServerPostHog, flush as flushAnalytics } from '@/lib/analytics/posthog'
import { captureAPIError } from '@/lib/analytics/sentry'
import { checkUserPermission, recordUsage } from '@/lib/permissions'

// Configure Edge Runtime
export const runtime = 'edge'

/**
 * POST /api/generate - Generate AI answer for a question
 */
export async function POST(req: NextRequest) {
  const startTime = Date.now()
  const posthog = getServerPostHog()
  
  try {
    // Parse and validate request body
    const body = await req.json()
    const validation = QuestionInputSchema.safeParse(body)
    
    if (!validation.success) {
      return NextResponse.json(
        createErrorResponse('INVALID', 'Invalid request format', {
          errors: validation.error?.issues || ['Validation failed']
        }),
        { status: 400 }
      )
    }

    const { text, meta } = validation.data
    const { subject, grade, language = 'auto', target_language = 'en' } = meta || {
      subject: undefined,
      grade: undefined, 
      language: 'auto' as const,
      target_language: 'en' as const
    }

    // Get current user
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json(
        createErrorResponse('INVALID', 'Authentication required'),
        { status: 401 }
      )
    }

    // Track generate_start event
    posthog?.capture({
      distinctId: user.id,
      event: 'generate_start',
      properties: {
        input_length: text.length,
        language: language,
        subject: subject,
        grade: grade,
        has_file: false, // This API doesn't handle files directly
        timestamp: new Date().toISOString()
      }
    })

    // Check AI analysis permissions
    const permissionCheck = await checkUserPermission(user.email, 'ai_analysis')
    if (!permissionCheck.allowed) {
      // Track limit_hit event
      posthog?.capture({
        distinctId: user.id,
        event: 'permission_denied',
        properties: {
          action: 'ai_analysis',
          reason: permissionCheck.reason,
          upgrade_required: permissionCheck.upgradeRequired,
          timestamp: new Date().toISOString()
        }
      })

      return NextResponse.json(
        createErrorResponse('PERMISSION_DENIED', permissionCheck.reason || '权限不足', {
          upgradeRequired: permissionCheck.upgradeRequired,
          action: 'ai_analysis'
        }),
        { status: 403 }
      )
    }

    // Normalize and process the question text
    const normalizedText = normalize(text)
    
    if (!normalizedText || normalizedText.length < 10) {
      return NextResponse.json(
        createErrorResponse('INVALID', 'Question text is too short or empty'),
        { status: 400 }
      )
    }

    // Detect language and question characteristics
    const detectedLanguage = language === 'auto' ? detectLanguage(normalizedText) : language
    const questionType = detectQuestionType(normalizedText)
    const optionsResult = extractOptions(normalizedText)

    // Create cache key
    const cacheKey = await createAnswerCacheKey(normalizedText, optionsResult.options.map(o => o.text), {
      subject,
      grade,
      language: detectedLanguage,
      targetLanguage: target_language
    })

    // Check cache first
    const cachedAnswer = await answerCache.get(cacheKey)
    if (cachedAnswer) {
      const responseTime = Date.now() - startTime
      
      // Track cache hit event
      posthog?.capture({
        distinctId: user.id,
        event: 'from_cache',
        properties: {
          hash: cacheKey,
          response_time_ms: responseTime,
          timestamp: new Date().toISOString()
        }
      })

      // Update cache hit statistics
      await updateUsageStats(user.id, { cacheHit: true })
      
      return NextResponse.json(
        createSuccessResponse(cachedAnswer, true, {
          processing_time_ms: responseTime,
          from_cache: true,
          question_type: questionType.type
        })
      )
    }

    // Generate AI response using Smart Router
    const smartRouter = getSmartAIRouter()
    
    // Build prompts
    const { systemPrompt, userPrompt } = buildCompletePrompt(normalizedText, {
      targetLanguage: target_language,
      inputLanguage: detectedLanguage,
      subject,
      grade,
      questionType: questionType.type
    })

    // Call Smart AI Router (automatically selects best model)
    const aiResult = await smartRouter.generateAnswer({
      normalizedPrompt: userPrompt,
      targetLang: target_language,
      systemPrompt,
      questionText: normalizedText,
      questionType: questionType.type,
      subject
    })

    if (!aiResult.success) {
      const responseTime = Date.now() - startTime
      
      // Track failed generation event
      posthog?.capture({
        distinctId: user.id,
        event: 'generate_finish',
        properties: {
          success: false,
          from_cache: false,
          response_time_ms: responseTime,
          ai_provider: aiResult.details?.provider,
          error: aiResult.error,
          question_type: questionType.type,
          timestamp: new Date().toISOString()
        }
      })

      // Capture API error
      captureAPIError(
        new Error(aiResult.message),
        '/api/generate',
        user.id,
        {
          provider: aiResult.details?.provider,
          error_code: aiResult.error,
          question_type: questionType.type
        }
      )

      // Update error statistics
      await updateUsageStats(user.id, { error: true })
      
      return NextResponse.json(
        createErrorResponse(aiResult.error === 'RATE_LIMIT' ? 'LIMIT' : aiResult.error, aiResult.message, {
          provider: aiResult.details?.provider,
          processing_time_ms: responseTime
        }),
        { status: aiResult.error === 'MODERATION' ? 400 : 500 }
      )
    }

    // Validate and sanitize AI response
    const sanitizedAnswer = sanitizeAIResponse(aiResult.data)
    const finalValidation = validateAIResponse(sanitizedAnswer)
    
    if (!finalValidation.success) {
      await updateUsageStats(user.id, { error: true })
      
      return NextResponse.json(
        createErrorResponse('INVALID', 'AI response validation failed', {
          errors: finalValidation.errors
        }),
        { status: 500 }
      )
    }

    // 🔍 智能答案验证机制
    const { validateAnswer, generateDisclaimer } = await import('@/lib/ai/schema')
    const validationResult = await validateAnswer(sanitizedAnswer, subject)
    const disclaimer = generateDisclaimer(subject, questionType.confidence < 0.8)

    console.log(`答案验证完成: 验证通过=${validationResult.verified}, 置信度=${validationResult.confidence_score}, 方法=${validationResult.verification_method}`)

    // 创建扩展答案对象，包含验证信息和免责声明
    const extendedAnswer = {
      ...sanitizedAnswer,
      validation: validationResult,
      disclaimer: disclaimer
    }

    // Store in database (using sanitized answer for storage)
    const dbResult = await storeAnswerInDatabase(user.id, {
      questionText: normalizedText,
      answer: sanitizedAnswer,
      metadata: {
        subject,
        grade,
        language: detectedLanguage,
        targetLanguage: target_language,
        questionType: questionType.type,
        hasOptions: optionsResult.hasValidOptions,
        optionCount: optionsResult.options.length,
        aiProvider: aiResult.metadata?.provider,
        tokens: aiResult.metadata?.tokens,
        costCents: aiResult.metadata?.costCents,
        // 添加验证信息到元数据
        validation_verified: validationResult.verified,
        validation_score: validationResult.confidence_score,
        validation_method: validationResult.verification_method
      }
    })

    if (!dbResult.success) {
      console.error('Database storage failed:', dbResult.error)
      // Continue anyway - don't fail the request for storage issues
    }

    // Cache the result (cache sanitized answer without extra metadata)
    await answerCache.set(cacheKey, sanitizedAnswer, 86400) // Cache for 24 hours

    // Update usage statistics
    await updateUsageStats(user.id, {
      tokens: aiResult.metadata?.tokens || 0,
      costCents: aiResult.metadata?.costCents || 0
    })

    // Record AI usage for permissions tracking
    await recordUsage(user.email, 'ai_analysis', {
      question_type: questionType,
      subject: subject,
      model_used: aiResult.selectedModel?.model,
      tokens: aiResult.metadata?.tokens,
      processing_time: Date.now() - startTime
    })

    const responseTime = Date.now() - startTime

    // Track successful generation event with validation metrics
    posthog?.capture({
      distinctId: user.id,
      event: 'generate_finish',
      properties: {
        success: true,
        from_cache: false,
        response_time_ms: responseTime,
        tokens_used: aiResult.details?.tokens_used,
        cost_cents: aiResult.details?.cost_estimate,
        ai_provider: aiResult.selectedModel?.provider || aiResult.details?.provider,
        ai_model: aiResult.selectedModel?.model || aiResult.details?.model,
        cost_level: aiResult.selectedModel?.costLevel,
        confidence: questionType.confidence,
        question_type: questionType.type,
        // 🔍 新增验证指标
        validation_verified: validationResult.verified,
        validation_score: validationResult.confidence_score,
        validation_method: validationResult.verification_method,
        timestamp: new Date().toISOString()
      }
    })

    // 🔄 自动保存到用户错题本
    try {
      if (dbResult.success && dbResult.data?.id) {
        const { updateLearningStats } = await import('@/app/api/user-questions/route')
        const supabase = createClient()
        
        // 生成错题本hash（避免重复）
        const crypto = await import('crypto')
        const userQuestionHash = crypto
          .createHash('sha256')
          .update(normalizedText + (subject || '') + user.id)
          .digest('hex')
          .substring(0, 32)
        
        // 创建用户错题本记录
        const { data: userQuestion, error: saveError } = await supabase
          .from('user_questions')
          .insert({
            user_id: user.id,
            content: normalizedText,
            subject: subject || null,
            grade: grade || null,
            language: detectedLanguage,
            source: imageFile ? 'scan' : 'paste',
            original_file_name: imageFile?.name || null,
            original_file_type: imageFile?.type || null,
            hash: userQuestionHash,
            meta: {
              ai_question_id: dbResult.data.id,
              question_type: questionType.type,
              confidence: questionType.confidence,
              model_used: aiResult.selectedModel?.model,
              processing_time_ms: responseTime,
              validation: validationResult,
              disclaimer: disclaimer
            }
          })
          .select('id')
          .single()

        if (saveError && saveError.code !== '23505') { // 忽略重复键错误
          console.warn('自动保存到错题本失败:', saveError.message)
        } else if (userQuestion) {
          console.log(`✅ 题目已自动保存到用户 ${user.id} 的错题本 (ID: ${userQuestion.id})`)
          
          // 同时保存AI答案记录
          await supabase
            .from('user_answers')
            .insert({
              question_id: userQuestion.id,
              user_id: user.id,
              ai_answer: sanitizedAnswer.answer,
              ai_explanation: sanitizedAnswer.explanation,
              model_used: aiResult.selectedModel?.model || 'unknown',
              tokens: aiResult.metadata?.tokens || 0,
              cost_cents: aiResult.metadata?.costCents || 0,
              processing_time_ms: responseTime,
              validation_data: {
                verified: validationResult.verified,
                confidence_score: validationResult.confidence_score,
                verification_method: validationResult.verification_method,
                verification_notes: validationResult.verification_notes
              }
            })

          // 更新学习统计
          if (subject) {
            await updateLearningStats(user.id, subject, 'question_added')
          }
        }
      }
    } catch (autoSaveError) {
      console.error('自动保存到错题本过程中发生错误:', autoSaveError)
      // 不影响主要流程，继续执行
    }

    // Flush analytics before returning
    await flushAnalytics()

    // Return success response with extended answer (包含验证和免责声明)
    return NextResponse.json(
      createSuccessResponse(extendedAnswer, false, {
        processing_time_ms: responseTime,
        tokens_used: aiResult.details?.tokens_used,
        cost_cents: aiResult.details?.cost_estimate,
        model: aiResult.selectedModel?.model || aiResult.details?.model,
        provider: aiResult.selectedModel?.provider || aiResult.details?.provider,
        model_reason: aiResult.selectedModel?.reason,
        cost_level: aiResult.selectedModel?.costLevel,
        // 🎯 SmartRouter模型选择信息
        selected_for_reason: `${aiResult.selectedModel?.description} (${aiResult.selectedModel?.strengths?.join(', ')})`,
        model_strengths: aiResult.selectedModel?.strengths,
        question_type: questionType.type,
        confidence: questionType.confidence,
        from_cache: false
      })
    )

  } catch (error) {
    console.error('Generate API error:', error)
    
    // Capture server error
    captureAPIError(
      error instanceof Error ? error : new Error(String(error)),
      '/api/generate',
      undefined, // user might not be available here
      {
        processing_time_ms: Date.now() - startTime,
        error_type: 'server_error'
      }
    )

    // Track failed generation event
    posthog?.capture({
      distinctId: 'unknown',
      event: 'api_error',
      properties: {
        endpoint: '/api/generate',
        error_code: 'SERVER',
        error_message: error instanceof Error ? error.message : String(error),
        processing_time_ms: Date.now() - startTime,
        timestamp: new Date().toISOString()
      }
    })

    // Flush analytics before returning
    await flushAnalytics()
    
    return NextResponse.json(
      createErrorResponse('SERVER', 'Internal server error', {
        processing_time_ms: Date.now() - startTime
      }),
      { status: 500 }
    )
  }
}

/**
 * Check user usage limits
 */
async function checkUsageLimit(userId: string): Promise<{
  allowed: boolean
  message: string
  usage?: { count: number; limit: number }
  plan?: string
}> {
  try {
    const supabase = await createClient()
    
    // Get user profile to check plan
    const { data: profile } = await supabase
      .from('profiles')
      .select('plan')
      .eq('id', userId)
      .single()

    const plan = profile?.plan || 'free'
    const maxRequests = plan === 'free' 
      ? parseInt(process.env.MAX_FREE_REQUESTS_PER_DAY || '5', 10)
      : 1000 // Pro users get much higher limit

    // Get today's usage
    const today = new Date().toISOString().split('T')[0] // YYYY-MM-DD
    
    const { data: usage } = await supabase
      .from('usage_daily')
      .select('count')
      .eq('user_id', userId)
      .eq('date', today)
      .single()

    const currentCount = usage?.count || 0

    if (currentCount >= maxRequests) {
      return {
        allowed: false,
        message: plan === 'free' 
          ? 'Daily free limit reached. Please upgrade to Pro for unlimited access.'
          : 'Daily limit reached. Please contact support.',
        usage: { count: currentCount, limit: maxRequests },
        plan
      }
    }

    return {
      allowed: true,
      message: 'Usage within limits',
      usage: { count: currentCount, limit: maxRequests },
      plan
    }
  } catch (error) {
    console.error('Usage check error:', error)
    // Fail open - allow request if we can't check usage
    return {
      allowed: true,
      message: 'Usage check failed, allowing request'
    }
  }
}

/**
 * Update usage statistics
 */
async function updateUsageStats(
  userId: string, 
  stats: { 
    cacheHit?: boolean
    tokens?: number
    costCents?: number
    error?: boolean
  }
): Promise<void> {
  try {
    const supabase = await createClient()
    const today = new Date().toISOString().split('T')[0]

    // If it's a cache hit, don't increment the main counter
    if (stats.cacheHit) {
      const { error } = await supabase
        .from('usage_daily')
        .upsert({
          user_id: userId,
          date: today,
          cache_hits: 1
        }, {
          onConflict: 'user_id,date',
          ignoreDuplicates: false
        })

      if (error) {
        console.error('Cache hit stats update error:', error)
      }
      return
    }

    // For actual AI calls, increment the main counter
    const updateData: any = {
      user_id: userId,
      date: today,
      count: 1
    }

    if (stats.tokens) {
      updateData.tokens_used = stats.tokens
    }

    if (stats.costCents) {
      updateData.cost_cents = stats.costCents
    }

    if (stats.error) {
      updateData.errors = 1
    }

    const { error } = await supabase
      .from('usage_daily')
      .upsert(updateData, {
        onConflict: 'user_id,date',
        ignoreDuplicates: false
      })

    if (error) {
      console.error('Usage stats update error:', error)
    }
  } catch (error) {
    console.error('Update usage stats error:', error)
  }
}

/**
 * Store answer and related data in database
 */
async function storeAnswerInDatabase(
  userId: string,
  data: {
    questionText: string
    answer: any
    metadata: any
  }
): Promise<{ success: boolean; error?: string; questionId?: string }> {
  try {
    const supabase = await createClient()

    // Store question
    const { data: question, error: questionError } = await supabase
      .from('questions')
      .insert({
        user_id: userId,
        content: data.questionText,
        language: data.metadata.language,
        subject: data.metadata.subject,
        grade: data.metadata.grade,
        source: 'paste',
        meta: {
          question_type: data.metadata.questionType,
          has_options: data.metadata.hasOptions,
          option_count: data.metadata.optionCount,
          ai_provider: data.metadata.aiProvider
        },
        hash: await hashPrompt(data.questionText)
      })
      .select()
      .single()

    if (questionError || !question) {
      return { success: false, error: questionError?.message || 'Failed to store question' }
    }

    // Store answer
    const { error: answerError } = await supabase
      .from('answers')
      .insert({
        question_id: question.id,
        answer: data.answer.answer,
        explanation: data.answer.explanation,
        confidence: data.answer.confidence || null,
        model: data.metadata.aiProvider || 'unknown',
        tokens: data.metadata.tokens || 0,
        cost_cents: data.metadata.costCents || 0,
        lang: data.metadata.targetLanguage
      })

    if (answerError) {
      console.error('Answer storage error:', answerError)
      // Continue even if answer storage fails
    }

    // Store flashcards
    if (data.answer.flashcards && data.answer.flashcards.length > 0) {
      const flashcardsData = data.answer.flashcards.map((card: any) => ({
        question_id: question.id,
        front: card.front,
        back: card.back,
        hint: card.hint || null,
        tags: card.tags || [],
        difficulty: card.difficulty || 2,
        spaced_due_at: new Date().toISOString() // Available immediately
      }))

      const { error: flashcardsError } = await supabase
        .from('flashcards')
        .insert(flashcardsData)

      if (flashcardsError) {
        console.error('Flashcards storage error:', flashcardsError)
        // Continue even if flashcard storage fails
      }
    }

    return { success: true, questionId: question.id }
  } catch (error) {
    console.error('Database storage error:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

/**
 * Handle OPTIONS request for CORS
 */
export async function OPTIONS(req: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  })
}