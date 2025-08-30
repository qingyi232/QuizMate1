/**
 * /api/questions/import - 批量导入题目API（仅用于样本数据导入）
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/db/supabase-server'
import { z } from 'zod'

const ImportQuestionSchema = z.object({
  content: z.string().min(1).max(4000),
  subject: z.string().optional(),
  grade: z.string().optional(), 
  language: z.string().default('en'),
  meta: z.record(z.any()).optional()
})

/**
 * POST /api/questions/import - 批量导入题目（无需认证，仅开发用）
 */
export async function POST(req: NextRequest) {
  try {
    // 只在开发环境允许
    if (process.env.NODE_ENV !== 'development') {
      return NextResponse.json(
        { error: 'Import only available in development' },
        { status: 403 }
      )
    }

    const body = await req.json()
    const validation = ImportQuestionSchema.safeParse(body)

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

    // 检查是否已存在相同题目（全局检查，不限制用户）
    const { data: existingQuestion } = await supabase
      .from('questions')
      .select('id')
      .eq('hash', hash)
      .single()

    if (existingQuestion) {
      return NextResponse.json(
        { error: 'Question already exists', questionId: existingQuestion.id },
        { status: 409 }
      )
    }

    // 创建公共题目（使用系统用户ID）
    const SYSTEM_USER_ID = '00000000-0000-0000-0000-000000000000' // 系统用户ID
    
    const { data: question, error } = await supabase
      .from('questions')
      .insert({
        user_id: SYSTEM_USER_ID, // 系统用户，表示公共题目
        content: questionData.content,
        subject: questionData.subject,
        grade: questionData.grade,
        language: questionData.language,
        source: 'import',
        hash,
        meta: {
          ...questionData.meta,
          is_sample: true,
          public: true,
          created_by: 'system'
        }
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