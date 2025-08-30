/**
 * /api/questions - 题库管理API
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/db/supabase-server'
import { getCurrentUser } from '@/lib/auth/auth'
import { z } from 'zod'

const QuestionQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(50).default(20),
  subject: z.string().optional(),
  grade: z.string().optional(),
  language: z.string().optional(),
  search: z.string().optional(),
  user_only: z.coerce.boolean().default(false)
})

const QuestionCreateSchema = z.object({
  content: z.string().min(1).max(4000),
  subject: z.string().optional(),
  grade: z.string().optional(),
  language: z.string().default('en'),
  meta: z.record(z.any()).optional(),
  source: z.enum(['paste', 'upload', 'import']).default('paste')
})

/**
 * GET /api/questions - 获取题库列表
 */
export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser()
    const { searchParams } = new URL(req.url)
    
    const query = QuestionQuerySchema.parse({
      page: searchParams.get('page') || undefined,
      limit: searchParams.get('limit') || undefined,
      subject: searchParams.get('subject') || undefined,
      grade: searchParams.get('grade') || undefined,
      language: searchParams.get('language') || undefined,
      search: searchParams.get('search') || undefined,
      user_only: searchParams.get('user_only') || undefined
    })

    const supabase = await createClient()
    
    // 构建查询
    let dbQuery = supabase
      .from('questions')
      .select(`
        id,
        content,
        subject,
        grade,
        language,
        created_at,
        answers:answers(
          id,
          answer,
          explanation,
          confidence,
          model
        ),
        flashcards:flashcards(
          id,
          front,
          back,
          difficulty
        )
      `)

    // 应用过滤条件
    if (query.user_only && user) {
      dbQuery = dbQuery.eq('user_id', user.id)
    } else if (!user) {
      // 未登录用户只能看公开题目
      dbQuery = dbQuery.eq('meta->public', true)
    } else {
      // 已登录用户可以看自己的题目和公开题目
      dbQuery = dbQuery.or(`user_id.eq.${user.id},meta->public.eq.true`)
    }

    if (query.subject) {
      dbQuery = dbQuery.ilike('subject', `%${query.subject}%`)
    }

    if (query.grade) {
      dbQuery = dbQuery.ilike('grade', `%${query.grade}%`)
    }

    if (query.language) {
      dbQuery = dbQuery.eq('language', query.language)
    }

    if (query.search) {
      dbQuery = dbQuery.ilike('content', `%${query.search}%`)
    }

    // 分页
    const offset = (query.page - 1) * query.limit
    dbQuery = dbQuery
      .order('created_at', { ascending: false })
      .range(offset, offset + query.limit - 1)

    const { data: questions, error, count } = await dbQuery

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch questions', details: error.message },
        { status: 500 }
      )
    }

    // 获取总数（用于分页）
    const { count: totalCount } = await supabase
      .from('questions')
      .select('*', { count: 'exact', head: true })

    return NextResponse.json({
      success: true,
      data: {
        questions: questions || [],
        pagination: {
          page: query.page,
          limit: query.limit,
          total: totalCount || 0,
          hasMore: totalCount ? offset + query.limit < totalCount : false
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
 * POST /api/questions - 创建新题目
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
    const validation = QuestionCreateSchema.safeParse(body)

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
      .update(questionData.content + (questionData.subject || '') + (questionData.grade || ''))
      .digest('hex')
      .substring(0, 32)

    // 检查是否已存在相同题目
    const { data: existingQuestion } = await supabase
      .from('questions')
      .select('id')
      .eq('hash', hash)
      .eq('user_id', user.id)
      .single()

    if (existingQuestion) {
      return NextResponse.json(
        { error: 'Question already exists', questionId: existingQuestion.id },
        { status: 409 }
      )
    }

    // 创建新题目
    const { data: question, error } = await supabase
      .from('questions')
      .insert({
        user_id: user.id,
        content: questionData.content,
        subject: questionData.subject,
        grade: questionData.grade,
        language: questionData.language,
        source: questionData.source,
        hash,
        meta: questionData.meta || {}
      })
      .select()
      .single()

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { error: 'Failed to create question', details: error.message },
        { status: 500 }
      )
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