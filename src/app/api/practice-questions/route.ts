/**
 * /api/practice-questions - 练习题库API（全球经典题目）
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/db/supabase-server'
import { z } from 'zod'

const PracticeQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(50).default(20),
  subject: z.string().optional(),
  grade: z.string().optional(),
  language: z.string().optional(),
  difficulty: z.enum(['easy', 'medium', 'hard']).optional(),
  question_type: z.string().optional(),
  search: z.string().optional(),
  tags: z.string().optional(), // 逗号分隔的标签
  verified_only: z.coerce.boolean().default(false),
  sort_by: z.enum(['popularity', 'difficulty', 'created_at']).default('popularity')
})

/**
 * GET /api/practice-questions - 获取练习题库
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    
    const query = PracticeQuerySchema.parse({
      page: searchParams.get('page') || undefined,
      limit: searchParams.get('limit') || undefined,
      subject: searchParams.get('subject') || undefined,
      grade: searchParams.get('grade') || undefined,
      language: searchParams.get('language') || undefined,
      difficulty: searchParams.get('difficulty') || undefined,
      question_type: searchParams.get('question_type') || undefined,
      search: searchParams.get('search') || undefined,
      tags: searchParams.get('tags') || undefined,
      verified_only: searchParams.get('verified_only') || undefined,
      sort_by: searchParams.get('sort_by') || undefined
    })

    const supabase = await createClient()
    
    // 构建查询 - 使用练习题库表
    let dbQuery = supabase
      .from('practice_question_summary') // 使用视图以获取答案
      .select('*', { count: 'exact' })

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

    if (query.difficulty) {
      dbQuery = dbQuery.eq('difficulty', query.difficulty)
    }

    if (query.question_type) {
      dbQuery = dbQuery.eq('question_type', query.question_type)
    }

    if (query.verified_only) {
      dbQuery = dbQuery.eq('verified', true)
    }

    if (query.search) {
      dbQuery = dbQuery.ilike('content', `%${query.search}%`)
    }

    if (query.tags) {
      const tagArray = query.tags.split(',').map(tag => tag.trim())
      dbQuery = dbQuery.overlaps('tags', tagArray)
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
        { error: 'Failed to fetch practice questions', details: error.message },
        { status: 500 }
      )
    }

    // 获取学科统计
    const { data: subjectStats } = await supabase
      .from('practice_questions')
      .select('subject, count(*)')
      .group('subject')

    // 获取难度统计  
    const { data: difficultyStats } = await supabase
      .from('practice_questions')
      .select('difficulty, count(*)')
      .group('difficulty')

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
          subjects: subjectStats || [],
          difficulties: difficultyStats || [],
          filters_applied: {
            subject: query.subject,
            grade: query.grade,
            language: query.language,
            difficulty: query.difficulty,
            verified_only: query.verified_only
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
 * GET /api/practice-questions/[id] - 获取单个练习题详情
 */
export async function getQuestionById(id: string) {
  try {
    const supabase = await createClient()
    
    const { data: question, error } = await supabase
      .from('practice_question_summary')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      throw error
    }

    // 增加热度
    await supabase
      .from('practice_questions')
      .update({ popularity_score: question.popularity_score + 1 })
      .eq('id', id)

    return {
      success: true,
      data: { question }
    }

  } catch (error) {
    console.error('Database error:', error)
    return {
      success: false,
      error: 'Failed to fetch question details'
    }
  }
}