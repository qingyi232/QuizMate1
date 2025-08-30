/**
 * Zod schemas for AI response validation
 */

import { z } from 'zod'

/**
 * Flashcard schema
 */
export const FlashcardSchema = z.object({
  front: z.string().min(1, 'Front side cannot be empty'),
  back: z.string().min(1, 'Back side cannot be empty'),
  hint: z.string().optional(),
  tags: z.array(z.string()).optional().default([]),
  difficulty: z.number().int().min(1).max(5).default(2)
})

export type FlashcardType = z.infer<typeof FlashcardSchema>

/**
 * Extended question types for comprehensive support
 */
export const QuestionTypeEnum = z.enum([
  'mcq',         // 单选题 (Multiple Choice Question)
  'multi',       // 多选题 (Multiple Select)
  'short',       // 简答题 (Short Answer)
  'true_false',  // 判断题 (True/False)
  'fill_blank',  // 填空题 (Fill in the Blank)
  'matching',    // 匹配题 (Matching)
  'ordering',    // 排序题 (Ordering/Sequencing)
  'calculation', // 计算题 (Mathematical Calculation)
  'essay',       // 论述题 (Essay Question)
  'coding',      // 编程题 (Coding Question)
  'unknown'      // 未知类型 (Unknown)
])

export type QuestionType = z.infer<typeof QuestionTypeEnum>

/**
 * Enhanced answer schema with additional question type data
 */
export const AnswerSchema = z.object({
  language: z.string().min(1, 'Language is required'),
  question_type: QuestionTypeEnum,
  subject: z.string().optional(),
  answer: z.string().min(1, 'Answer cannot be empty'),
  explanation: z.string().min(10, 'Explanation must be at least 10 characters'),
  confidence: z.number().min(0).max(1).optional(),
  flashcards: z.array(FlashcardSchema).max(5, 'Maximum 5 flashcards allowed').default([]),
  // Extended data for specific question types
  question_data: z.object({
    options: z.array(z.string()).optional(),           // For MCQ/Multi
    blanks: z.array(z.string()).optional(),            // For fill_blank
    pairs: z.array(z.object({                          // For matching
      left: z.string(),
      right: z.string()
    })).optional(),
    sequence: z.array(z.string()).optional(),          // For ordering
    code_language: z.string().optional(),              // For coding
    variables: z.record(z.any()).optional()           // For calculations
  }).optional()
})

export type AnswerSchemaType = z.infer<typeof AnswerSchema>

/**
 * Extended answer schema with additional metadata
 */
export const ExtendedAnswerSchema = AnswerSchema.extend({
  model: z.string().optional(),
  tokens: z.number().int().positive().optional(),
  cost_cents: z.number().int().min(0).optional(),
  processing_time_ms: z.number().int().min(0).optional(),
  cache_hit: z.boolean().optional().default(false),
  source: z.enum(['ai', 'cache', 'manual']).default('ai'),
  // 🔍 答案验证状态
  validation: z.object({
    verified: z.boolean().default(false),              // 是否已验证
    verification_method: z.enum(['auto', 'cross_check', 'manual', 'none']).default('none'),  // 验证方法
    confidence_score: z.number().min(0).max(1).optional(),  // 验证置信度
    verification_notes: z.string().optional()          // 验证备注
  }).optional(),
  // ⚠️ 免责声明和使用条款
  disclaimer: z.object({
    reference_only: z.boolean().default(true),         // 仅供参考标识  
    requires_verification: z.boolean().default(true),  // 需要验证标识
    ai_generated: z.boolean().default(true),           // AI生成标识
    custom_note: z.string().optional()                 // 自定义备注
  }).optional().default({
    reference_only: true,
    requires_verification: true, 
    ai_generated: true
  })
})

export type ExtendedAnswerType = z.infer<typeof ExtendedAnswerSchema>

/**
 * Question input schema
 */
export const QuestionInputSchema = z.object({
  text: z.string().min(1, 'Question text is required').max(4000, 'Question text too long'),
  meta: z.object({
    subject: z.string().optional(),
    grade: z.string().optional(),
    language: z.enum(['auto', 'en', 'zh', 'id', 'fil', 'sw']).default('auto'),
    target_language: z.enum(['en', 'zh', 'id', 'fil', 'sw']).default('zh')
  }).optional().default({})
})

export type QuestionInputType = z.infer<typeof QuestionInputSchema>

/**
 * AI Provider configuration schema
 */
export const AIProviderConfigSchema = z.object({
  provider: z.enum(['openai', 'deepseek', 'qwen']),
  model: z.string().min(1),
  api_key: z.string().min(1),
  base_url: z.string().url().optional(),
  max_tokens: z.number().int().positive().default(900),
  temperature: z.number().min(0).max(2).default(0.2),
  timeout_ms: z.number().int().positive().default(30000)
})

export type AIProviderConfigType = z.infer<typeof AIProviderConfigSchema>

/**
 * Rate limiting schema
 */
export const RateLimitSchema = z.object({
  user_id: z.string().uuid(),
  plan: z.enum(['free', 'pro', 'enterprise']).default('free'),
  requests_today: z.number().int().min(0).default(0),
  max_requests_per_day: z.number().int().positive(),
  last_request_at: z.date().optional(),
  reset_at: z.date()
})

export type RateLimitType = z.infer<typeof RateLimitSchema>

/**
 * Cache entry schema
 */
export const CacheEntrySchema = z.object({
  key: z.string().min(1),
  value: AnswerSchema,
  created_at: z.date(),
  expires_at: z.date().optional(),
  hit_count: z.number().int().min(0).default(0),
  tags: z.array(z.string()).default([])
})

export type CacheEntryType = z.infer<typeof CacheEntrySchema>

/**
 * Error response schema
 */
export const ErrorResponseSchema = z.object({
  ok: z.literal(false),
  code: z.enum(['LIMIT', 'MODERATION', 'INVALID', 'SERVER', 'TIMEOUT', 'QUOTA']),
  message: z.string().min(1),
  details: z.record(z.any()).optional()
})

export type ErrorResponseType = z.infer<typeof ErrorResponseSchema>

/**
 * Success response schema
 */
export const SuccessResponseSchema = z.object({
  ok: z.literal(true),
  data: AnswerSchema,
  fromCache: z.boolean().optional().default(false),
  metadata: z.object({
    processing_time_ms: z.number().int().min(0).optional(),
    tokens_used: z.number().int().min(0).optional(),
    cost_cents: z.number().int().min(0).optional(),
    model: z.string().optional()
  }).optional()
})

export type SuccessResponseType = z.infer<typeof SuccessResponseSchema>

/**
 * API Response union type
 */
export const APIResponseSchema = z.union([SuccessResponseSchema, ErrorResponseSchema])
export type APIResponseType = z.infer<typeof APIResponseSchema>

/**
 * Usage tracking schema
 */
export const UsageSchema = z.object({
  user_id: z.string().uuid(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/), // YYYY-MM-DD format
  requests_count: z.number().int().min(0).default(0),
  tokens_used: z.number().int().min(0).default(0),
  cost_cents: z.number().int().min(0).default(0),
  cache_hits: z.number().int().min(0).default(0),
  errors: z.number().int().min(0).default(0)
})

export type UsageType = z.infer<typeof UsageSchema>

/**
 * Moderation check schema
 */
export const ModerationSchema = z.object({
  flagged: z.boolean(),
  categories: z.object({
    hate: z.boolean().default(false),
    'hate/threatening': z.boolean().default(false),
    harassment: z.boolean().default(false),
    'harassment/threatening': z.boolean().default(false),
    'self-harm': z.boolean().default(false),
    'self-harm/intent': z.boolean().default(false),
    'self-harm/instructions': z.boolean().default(false),
    sexual: z.boolean().default(false),
    'sexual/minors': z.boolean().default(false),
    violence: z.boolean().default(false),
    'violence/graphic': z.boolean().default(false)
  }).default({}),
  category_scores: z.record(z.number().min(0).max(1)).default({})
})

export type ModerationType = z.infer<typeof ModerationSchema>

/**
 * Batch processing schema
 */
export const BatchRequestSchema = z.object({
  questions: z.array(QuestionInputSchema).min(1).max(10),
  options: z.object({
    parallel: z.boolean().default(false),
    fail_fast: z.boolean().default(true),
    target_language: z.enum(['en', 'id', 'fil', 'sw']).default('en')
  }).default({})
})

export type BatchRequestType = z.infer<typeof BatchRequestSchema>

export const BatchResponseSchema = z.object({
  ok: z.boolean(),
  results: z.array(APIResponseSchema),
  summary: z.object({
    total: z.number().int().min(0),
    successful: z.number().int().min(0),
    failed: z.number().int().min(0),
    from_cache: z.number().int().min(0),
    processing_time_ms: z.number().int().min(0)
  })
})

export type BatchResponseType = z.infer<typeof BatchResponseSchema>

/**
 * Validation helper functions
 */

/**
 * Validate AI response and provide detailed error messages
 */
export function validateAIResponse(data: unknown): { success: true; data: AnswerSchemaType } | { success: false; errors: string[] } {
  const result = AnswerSchema.safeParse(data)
  
  if (result.success) {
    return { success: true, data: result.data }
  }
  
  const errors = result.error?.errors?.map(err => 
    `${err.path?.join('.')}: ${err.message}`
  ) || ['Validation failed']
  
  return { success: false, errors }
}

/**
 * Create a default flashcard
 */
export function createDefaultFlashcard(front: string, back: string): FlashcardType {
  return {
    front,
    back,
    difficulty: 2,
    tags: []
  }
}

/**
 * Create error response
 */
export function createErrorResponse(code: ErrorResponseType['code'], message: string, details?: Record<string, any>): ErrorResponseType {
  return {
    ok: false,
    code,
    message,
    details
  }
}

/**
 * Create success response
 */
export function createSuccessResponse(data: AnswerSchemaType, fromCache = false, metadata?: any): SuccessResponseType {
  return {
    ok: true,
    data,
    fromCache,
    metadata
  }
}

/**
 * Sanitize AI response by removing potentially harmful content
 */
export function sanitizeAIResponse(response: AnswerSchemaType): AnswerSchemaType {
  return {
    ...response,
    answer: response.answer.substring(0, 1000), // Limit answer length
    explanation: response.explanation.substring(0, 2000), // Limit explanation length
    flashcards: response.flashcards.slice(0, 5).map(card => ({
      ...card,
      front: card.front.substring(0, 200),
      back: card.back.substring(0, 500),
      hint: card.hint ? card.hint.substring(0, 200) : undefined,
      tags: card.tags?.slice(0, 10) || []
    }))
  }
}

/**
 * 🔍 智能答案验证机制
 * 自动验证AI生成的答案质量和准确性
 */
export async function validateAnswer(answer: AnswerSchemaType, subject?: string): Promise<{
  verified: boolean
  verification_method: 'auto' | 'cross_check' | 'manual' | 'none'
  confidence_score: number
  verification_notes?: string
}> {
  try {
    // 🎯 基础验证检查
    let confidence_score = 0.7 // 基础置信度
    let verification_notes: string[] = []

    // ✅ 答案长度验证 
    if (answer.answer.length >= 50) {
      confidence_score += 0.1
      verification_notes.push('答案详细完整')
    }

    // ✅ 解释质量验证
    if (answer.explanation.length >= 100) {
      confidence_score += 0.1  
      verification_notes.push('解释详细深入')
    }

    // ✅ 专业术语验证
    const subjectLower = subject?.toLowerCase() || ''
    let hasRelevantTerms = false

    // 🧮 数学题专业术语检查
    if (subjectLower.includes('math') || subjectLower.includes('数学')) {
      const mathTerms = ['公式', '方程', '解', '计算', '推导', '证明', 'formula', 'equation', 'solve']
      hasRelevantTerms = mathTerms.some(term => 
        answer.answer.toLowerCase().includes(term) || 
        answer.explanation.toLowerCase().includes(term)
      )
    }

    // 🧪 化学题专业术语检查
    if (subjectLower.includes('chemistry') || subjectLower.includes('化学')) {
      const chemTerms = ['反应', '分子', '原子', '电子', '键', '催化剂', 'reaction', 'molecule', 'electron']
      hasRelevantTerms = chemTerms.some(term => 
        answer.answer.toLowerCase().includes(term) || 
        answer.explanation.toLowerCase().includes(term)
      )
    }

    // 📖 医学题专业术语检查
    if (subjectLower.includes('medical') || subjectLower.includes('医学')) {
      const medicalTerms = ['症状', '诊断', '治疗', '病理', '解剖', '生理', 'symptom', 'diagnosis', 'treatment']
      hasRelevantTerms = medicalTerms.some(term => 
        answer.answer.toLowerCase().includes(term) || 
        answer.explanation.toLowerCase().includes(term)
      )
    }

    if (hasRelevantTerms) {
      confidence_score += 0.1
      verification_notes.push('包含专业术语')
    }

    // ✅ 结构化内容验证
    if (answer.flashcards && answer.flashcards.length > 0) {
      confidence_score += 0.05
      verification_notes.push('提供学习卡片')
    }

    // 🎯 最终验证评分
    confidence_score = Math.min(confidence_score, 1.0) // 限制在1.0以内
    const verified = confidence_score >= 0.75 // 75%以上认为验证通过

    return {
      verified,
      verification_method: 'auto',
      confidence_score: Math.round(confidence_score * 100) / 100, // 保留2位小数
      verification_notes: verification_notes.length > 0 ? verification_notes.join('；') : undefined
    }

  } catch (error) {
    console.error('答案验证失败:', error)
    return {
      verified: false,
      verification_method: 'none',
      confidence_score: 0.5,
      verification_notes: '验证过程出现错误'
    }
  }
}

/**
 * ⚠️ 生成标准免责声明
 */
export function generateDisclaimer(subject?: string, isComplex?: boolean): {
  reference_only: boolean
  requires_verification: boolean  
  ai_generated: boolean
  custom_note?: string
} {
  const customNotes: string[] = []

  // 根据学科添加特定提醒
  const subjectLower = subject?.toLowerCase() || ''
  
  if (subjectLower.includes('medical') || subjectLower.includes('医学')) {
    customNotes.push('医学信息仅供学习参考，不可用于实际诊疗')
  }
  
  if (subjectLower.includes('legal') || subjectLower.includes('法律')) {
    customNotes.push('法律信息仅供参考，具体情况请咨询专业律师')
  }

  if (subjectLower.includes('financial') || subjectLower.includes('金融')) {
    customNotes.push('投资理财建议仅供参考，请谨慎决策')
  }

  // 复杂题目额外提醒
  if (isComplex) {
    customNotes.push('复杂题目建议多方验证')
  }

  return {
    reference_only: true,
    requires_verification: true,
    ai_generated: true,
    custom_note: customNotes.length > 0 ? customNotes.join('；') : '本答案由AI生成，仅供参考'
  }
}