/**
 * /api/subject-questions - 多学科国际化题库API
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/db/supabase-server'
import { getCurrentUser } from '@/lib/auth/auth'
import { checkUserPermission, recordUsage } from '@/lib/permissions'
import { z } from 'zod'

const SubjectQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(50).default(20),
  subject: z.string().optional(),
  topic: z.string().optional(),
  difficulty: z.enum(['easy', 'medium', 'hard']).optional(),
  language: z.string().optional(),
  question_type: z.string().optional(),
  search: z.string().optional(),
  verified_only: z.coerce.boolean().default(true),
  sort_by: z.enum(['popularity', 'difficulty', 'created_at', 'random']).default('popularity')
})

/**
 * GET /api/subject-questions - 获取多学科题库
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    
    // Get current user for permission checking
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Check question bank access permissions
    const permissionCheck = await checkUserPermission(user.email, 'question_access')
    if (!permissionCheck.allowed) {
      return NextResponse.json(
        { 
          error: permissionCheck.reason || '题库访问权限不足',
          upgradeRequired: permissionCheck.upgradeRequired,
          action: 'question_access'
        },
        { status: 403 }
      )
    }
    
    const query = SubjectQuerySchema.parse({
      page: searchParams.get('page') || undefined,
      limit: searchParams.get('limit') || undefined,
      subject: searchParams.get('subject') || undefined,
      topic: searchParams.get('topic') || undefined,
      difficulty: searchParams.get('difficulty') || undefined,
      language: searchParams.get('language') || undefined,
      question_type: searchParams.get('question_type') || undefined,
      search: searchParams.get('search') || undefined,
      verified_only: searchParams.get('verified_only') || undefined,
      sort_by: searchParams.get('sort_by') || undefined
    })

    const supabase = await createClient()
    
    // 构建查询
    let dbQuery = supabase
      .from('subject_questions_with_categories')
      .select('*', { count: 'exact' })

    // 添加筛选条件
    if (query.subject) {
      dbQuery = dbQuery.eq('subject', query.subject)
    }

    if (query.topic) {
      dbQuery = dbQuery.eq('topic', query.topic)
    }

    if (query.difficulty) {
      dbQuery = dbQuery.eq('difficulty', query.difficulty)
    }

    if (query.language) {
      dbQuery = dbQuery.eq('language', query.language)
    }

    if (query.question_type) {
      dbQuery = dbQuery.eq('question_type', query.question_type)
    }

    if (query.verified_only) {
      dbQuery = dbQuery.eq('verified', true)
    }

    if (query.search) {
      dbQuery = dbQuery.ilike('question', `%${query.search}%`)
    }

    // 排序
    switch (query.sort_by) {
      case 'popularity':
        dbQuery = dbQuery.order('popularity_score', { ascending: false })
        break
      case 'difficulty':
        dbQuery = dbQuery.order('difficulty_score', { ascending: true })
        break
      case 'created_at':
        dbQuery = dbQuery.order('created_at', { ascending: false })
        break
      case 'random':
        dbQuery = dbQuery.order('id', { ascending: false }) // 简化的随机排序
        break
      default:
        dbQuery = dbQuery.order('popularity_score', { ascending: false })
    }

    // 分页
    const offset = (query.page - 1) * query.limit
    dbQuery = dbQuery.range(offset, offset + query.limit - 1)

    const { data: questions, error, count } = await dbQuery

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch subject questions', details: error.message },
        { status: 500 }
      )
    }

    // 获取学科统计
    const { data: subjectStats } = await supabase
      .from('subject_statistics')
      .select('*')

    // 获取可用主题
    const { data: availableTopics } = await supabase
      .from('question_topics')
      .select('subject, topic_name, topic_name_zh, description')
      .eq('subject', query.subject || 'Mathematics') // 默认返回数学主题

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
        statistics: {
          total_questions: count || 0,
          subject_stats: subjectStats || [],
          available_topics: availableTopics || []
        },
        filters_applied: {
          subject: query.subject,
          topic: query.topic,
          difficulty: query.difficulty,
          language: query.language,
          verified_only: query.verified_only
        }
      }
    })

    // Record question access for usage tracking
    await recordUsage(user.email, 'question_access', {
      subject: query.subject,
      questions_count: data?.length || 0,
      page: query.page,
      filters: {
        topic: query.topic,
        difficulty: query.difficulty,
        language: query.language
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
 * GET /api/subject-questions/categories - 获取学科分类
 */
export async function getCategories() {
  try {
    const supabase = await createClient()
    
    const { data: categories, error } = await supabase
      .from('subject_categories')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true })

    if (error) {
      throw error
    }

    return {
      success: true,
      data: { categories: categories || [] }
    }

  } catch (error) {
    console.error('Database error:', error)
    return {
      success: false,
      error: 'Failed to fetch categories'
    }
  }
}