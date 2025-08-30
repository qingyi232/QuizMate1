/**
 * /api/subject-categories - 学科分类API
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/db/supabase-server'

/**
 * GET /api/subject-categories - 获取所有学科分类
 */
export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient()
    
    // 获取学科分类
    const { data: categories, error: categoriesError } = await supabase
      .from('subject_categories')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true })

    if (categoriesError) {
      throw categoriesError
    }

    // 获取每个学科的题目统计
    const { data: subjectStats, error: statsError } = await supabase
      .from('subject_statistics')
      .select('*')

    if (statsError) {
      console.warn('Failed to fetch subject statistics:', statsError)
    }

    // 合并分类和统计信息
    const categoriesWithStats = categories?.map(category => {
      // 根据分类匹配相关学科的统计
      let totalQuestions = 0
      let subjects = []

      if (category.category_name === 'Mathematics') {
        const mathStats = subjectStats?.find(s => s.subject === 'Mathematics')
        totalQuestions = mathStats?.total_questions || 0
        subjects = ['Mathematics']
      } else if (category.category_name === 'Science') {
        const scienceSubjects = ['Physics', 'Chemistry', 'Biology']
        subjects = scienceSubjects
        totalQuestions = scienceSubjects.reduce((sum, subject) => {
          const stats = subjectStats?.find(s => s.subject === subject)
          return sum + (stats?.total_questions || 0)
        }, 0)
      } else if (category.category_name === 'Language_Literature') {
        const langStats = subjectStats?.find(s => s.subject === 'English')
        totalQuestions = langStats?.total_questions || 0
        subjects = ['English']
      } else if (category.category_name === 'History_Social') {
        const historyStats = subjectStats?.find(s => s.subject === 'History')
        totalQuestions = historyStats?.total_questions || 0
        subjects = ['History']
      } else if (category.category_name === 'Computer_Technology') {
        const csStats = subjectStats?.find(s => s.subject === 'Computer_Science')
        totalQuestions = csStats?.total_questions || 0
        subjects = ['Computer_Science']
      }

      return {
        ...category,
        total_questions: totalQuestions,
        subjects: subjects
      }
    }) || []

    return NextResponse.json({
      success: true,
      data: {
        categories: categoriesWithStats,
        total_categories: categoriesWithStats.length,
        total_questions_across_all: categoriesWithStats.reduce(
          (sum, cat) => sum + cat.total_questions, 0
        )
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