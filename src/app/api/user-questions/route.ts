/**
 * /api/user-questions - 用户错题本API
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/db/supabase-server'
import { getCurrentUser } from '@/lib/auth/auth'
import { z } from 'zod'

const UserQuestionQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(50).default(20),
  subject: z.string().optional(),
  grade: z.string().optional(),
  language: z.string().optional(),
  source: z.enum(['paste', 'upload', 'scan', 'import']).optional(),
  search: z.string().optional(),
  mastery_level: z.coerce.number().min(0).max(5).optional(),
  needs_review: z.coerce.boolean().optional(), // 是否需要复习
  sort_by: z.enum(['created_at', 'last_reviewed', 'mastery_level', 'review_count']).default('created_at')
})

const UserQuestionCreateSchema = z.object({
  content: z.string().min(1).max(4000),
  subject: z.string().optional(),
  grade: z.string().optional(),
  language: z.string().default('en'),
  source: z.enum(['paste', 'upload', 'scan', 'import']).default('upload'),
  original_file_name: z.string().optional(),
  original_file_type: z.string().optional(),
  meta: z.record(z.any()).optional()
})

/**
 * GET /api/user-questions - 获取用户错题本
 */
export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(req.url)
    
    const query = UserQuestionQuerySchema.parse({
      page: searchParams.get('page') || undefined,
      limit: searchParams.get('limit') || undefined,
      subject: searchParams.get('subject') || undefined,
      grade: searchParams.get('grade') || undefined,
      language: searchParams.get('language') || undefined,
      source: searchParams.get('source') || undefined,
      search: searchParams.get('search') || undefined,
      mastery_level: searchParams.get('mastery_level') || undefined,
      needs_review: searchParams.get('needs_review') || undefined,
      sort_by: searchParams.get('sort_by') || undefined
    })

    const supabase = await createClient()
    
    // 构建查询 - 使用用户错题本视图
    let dbQuery = supabase
      .from('user_question_summary')
      .select('*', { count: 'exact' })
      .eq('user_id', user.id)

    // 添加筛选条件
    if (query.subject) {
      dbQuery = dbQuery.eq('subject', query.subject)
    }

    if (query.grade) {
      dbQuery = dbQuery.eq('grade', query.grade)
    }

    if (query.language) {
      dbQuery = dbQuery.eq('language', query.language)
    }

    if (query.source) {
      dbQuery = dbQuery.eq('source', query.source)
    }

    if (query.mastery_level !== undefined) {
      dbQuery = dbQuery.eq('mastery_level', query.mastery_level)
    }

    if (query.needs_review) {
      // 需要复习的题目：掌握程度低或很久没复习
      const oneWeekAgo = new Date()
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
      
      dbQuery = dbQuery.or(`mastery_level.lt.3,last_reviewed_at.lt.${oneWeekAgo.toISOString()}`)
    }

    if (query.search) {
      dbQuery = dbQuery.ilike('content', `%${query.search}%`)
    }

    // 排序
    switch (query.sort_by) {
      case 'created_at':
        dbQuery = dbQuery.order('created_at', { ascending: false })
        break
      case 'last_reviewed':
        dbQuery = dbQuery.order('last_reviewed_at', { ascending: false, nullsLast: true })
        break
      case 'mastery_level':
        dbQuery = dbQuery.order('mastery_level', { ascending: true })
        break
      case 'review_count':
        dbQuery = dbQuery.order('review_count', { ascending: false })
        break
      default:
        dbQuery = dbQuery.order('created_at', { ascending: false })
    }

    // 分页
    const offset = (query.page - 1) * query.limit
    dbQuery = dbQuery.range(offset, offset + query.limit - 1)

    const { data: questions, error, count } = await dbQuery

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch user questions', details: error.message },
        { status: 500 }
      )
    }

    // 获取用户学习统计
    const { data: learningStats } = await supabase
      .from('learning_stats')
      .select('*')
      .eq('user_id', user.id)

    // 获取掌握程度分布
    const { data: masteryStats } = await supabase
      .from('user_questions')
      .select('mastery_level, count(*)')
      .eq('user_id', user.id)
      .group('mastery_level')

    return NextResponse.json({
      success: true,
      data: {
        questions: questions || [],
        pagination: {
          page: query.page,
          limit: query.limit,
          total: count || 0,
          hasMore: count ? offset + query.limit < count : false
        },
        user_statistics: {
          total_questions: count || 0,
          learning_stats: learningStats || [],
          mastery_distribution: masteryStats || [],
          filters_applied: {
            subject: query.subject,
            mastery_level: query.mastery_level,
            needs_review: query.needs_review
          }
        }
      }
    })

  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/user-questions - 创建用户错题（通常由AI解析自动调用）
 */
export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const body = await req.json()
    const validation = UserQuestionCreateSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { 
          error: 'Validation failed',
          details: validation.error.issues
        },
        { status: 400 }
      )
    }

    const questionData = validation.data
    const supabase = await createClient()

    // 生成题目hash（用于去重）
    const crypto = await import('crypto')
    const hash = crypto
      .createHash('sha256')
      .update(questionData.content + (questionData.subject || '') + user.id)
      .digest('hex')
      .substring(0, 32)

    // 检查是否已存在相同题目
    const { data: existingQuestion } = await supabase
      .from('user_questions')
      .select('id')
      .eq('hash', hash)
      .eq('user_id', user.id)
      .single()

    if (existingQuestion) {
      // 如果题目已存在，增加复习次数
      await supabase
        .from('user_questions')
        .update({ 
          review_count: supabase.sql`review_count + 1`,
          last_reviewed_at: new Date().toISOString()
        })
        .eq('id', existingQuestion.id)

      return NextResponse.json({
        success: true,
        data: { 
          question_id: existingQuestion.id,
          message: 'Question already exists, review count updated'
        }
      })
    }

    // 创建新的错题记录
    const { data: question, error } = await supabase
      .from('user_questions')
      .insert({
        user_id: user.id,
        content: questionData.content,
        subject: questionData.subject,
        grade: questionData.grade,
        language: questionData.language,
        source: questionData.source,
        original_file_name: questionData.original_file_name,
        original_file_type: questionData.original_file_type,
        hash,
        meta: questionData.meta || {}
      })
      .select()
      .single()

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { error: 'Failed to create user question', details: error.message },
        { status: 500 }
      )
    }

    // 更新学习统计
    if (questionData.subject) {
      await updateLearningStats(user.id, questionData.subject, 'question_added')
    }

    return NextResponse.json({
      success: true,
      data: { question }
    })

  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * 更新用户学习统计
 */
async function updateLearningStats(
  userId: string, 
  subject: string, 
  action: 'question_added' | 'question_mastered' | 'study_time_added'
) {
  try {
    const supabase = await createClient()

    const { data: existing } = await supabase
      .from('learning_stats')
      .select('*')
      .eq('user_id', userId)
      .eq('subject', subject)
      .single()

    const updateData = {
      last_study_date: new Date().toISOString().split('T')[0], // 只要日期部分
      updated_at: new Date().toISOString()
    }

    if (action === 'question_added') {
      updateData.questions_solved = (existing?.questions_solved || 0) + 1
    } else if (action === 'question_mastered') {
      updateData.questions_mastered = (existing?.questions_mastered || 0) + 1
    }

    if (existing) {
      await supabase
        .from('learning_stats')
        .update(updateData)
        .eq('user_id', userId)
        .eq('subject', subject)
    } else {
      await supabase
        .from('learning_stats')
        .insert({
          user_id: userId,
          subject,
          questions_solved: action === 'question_added' ? 1 : 0,
          questions_mastered: action === 'question_mastered' ? 1 : 0,
          total_study_time_minutes: 0,
          streak_days: 1,
          ...updateData
        })
    }

  } catch (error) {
    console.error('Failed to update learning stats:', error)
    // 不抛出错误，学习统计失败不应影响主要功能
  }
}

export { updateLearningStats }