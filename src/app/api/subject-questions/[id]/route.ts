import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Supabase URL and key are required')
}

const supabase = createClient(supabaseUrl, supabaseKey)

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    if (!id) {
      return NextResponse.json(
        { error: '题目ID不能为空' },
        { status: 400 }
      )
    }

    // 从 subject_questions 表获取题目详情
    const { data: question, error } = await supabase
      .from('subject_questions')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      console.error('数据库查询错误:', error)
      return NextResponse.json(
        { error: '题目获取失败', details: error.message },
        { status: 500 }
      )
    }

    if (!question) {
      return NextResponse.json(
        { error: '题目不存在' },
        { status: 404 }
      )
    }

    // 解析 options 字段（如果是 JSON 字符串）
    let parsedOptions = null
    if (question.options) {
      try {
        parsedOptions = typeof question.options === 'string' 
          ? JSON.parse(question.options)
          : question.options
      } catch (parseError) {
        console.warn('选项解析失败:', parseError)
        // 如果解析失败，保持原始值
        parsedOptions = question.options
      }
    }

    const responseData = {
      ...question,
      options: parsedOptions
    }

    return NextResponse.json(responseData)

  } catch (error) {
    console.error('获取题目详情失败:', error)
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    )
  }
}