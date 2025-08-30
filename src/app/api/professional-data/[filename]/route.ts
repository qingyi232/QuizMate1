/**
 * API路由：提供专业题库文件
 */

import { NextRequest, NextResponse } from 'next/server'
import { readFileSync } from 'fs'
import { join } from 'path'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ filename: string }> }
) {
  try {
    const { filename } = await params
    
    // 安全检查：只允许访问特定的文件
    const allowedFiles = [
      'professional-questions.json',
      'medical-questions.csv',
      'legal-questions.csv',
      'engineering-questions.csv',
      'business-questions.csv',
      'science-questions.csv',
      'mathematics-questions.csv',
      'social-questions.csv',
      'humanities-questions.csv',
      'education-questions.csv',
      'environmental-questions.csv'
    ]
    
    if (!allowedFiles.includes(filename)) {
      return NextResponse.json(
        { error: 'File not found' },
        { status: 404 }
      )
    }
    
    // 构建文件路径
    const filePath = join(process.cwd(), 'professional-data', filename)
    
    try {
      const fileContent = readFileSync(filePath, 'utf-8')
      
      // 根据文件类型设置正确的Content-Type
      const contentType = filename.endsWith('.json') 
        ? 'application/json' 
        : 'text/csv'
      
      return new NextResponse(fileContent, {
        status: 200,
        headers: {
          'Content-Type': contentType,
          'Cache-Control': 'public, max-age=3600' // 缓存1小时
        }
      })
    } catch (fileError) {
      console.error('Error reading file:', fileError)
      return NextResponse.json(
        { error: 'File not found or could not be read' },
        { status: 404 }
      )
    }
    
  } catch (error) {
    console.error('Professional data API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}