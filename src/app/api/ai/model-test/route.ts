/**
 * AI模型选择测试API
 * 测试不同类型问题的模型选择逻辑
 */

import { NextRequest, NextResponse } from 'next/server'
import { getModelForTaskType } from '@/config/modelConfig'

/**
 * GET /api/ai/model-test
 * 测试模型选择逻辑
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const questionType = searchParams.get('type') || 'general'
    const subject = searchParams.get('subject') || undefined
    
    // 获取推荐模型
    const selectedModel = getModelForTaskType(questionType, subject)
    
    // 测试各种场景的模型选择
    const testScenarios = [
      {
        scenario: '数学计算题',
        questionType: 'calculation',
        subject: 'mathematics',
        recommended: getModelForTaskType('calculation', 'mathematics')
      },
      {
        scenario: '英语作文',
        questionType: 'essay',
        subject: 'english',
        recommended: getModelForTaskType('essay', 'english')
      },
      {
        scenario: '编程代码题',
        questionType: 'coding',
        subject: 'computer science',
        recommended: getModelForTaskType('coding', 'computer science')
      },
      {
        scenario: '中文语文',
        questionType: 'essay',
        subject: 'chinese',
        recommended: getModelForTaskType('essay', 'chinese')
      },
      {
        scenario: '物理实验',
        questionType: 'science',
        subject: 'physics',
        recommended: getModelForTaskType('science', 'physics')
      },
      {
        scenario: '历史分析',
        questionType: 'essay',
        subject: 'history',
        recommended: getModelForTaskType('essay', 'history')
      },
      {
        scenario: '填空题',
        questionType: 'fill_blank',
        subject: undefined,
        recommended: getModelForTaskType('fill_blank')
      },
      {
        scenario: '通用问答',
        questionType: 'general',
        subject: undefined,
        recommended: getModelForTaskType('general')
      }
    ]
    
    return NextResponse.json({
      success: true,
      query: {
        questionType,
        subject,
        selectedModel
      },
      test_scenarios: testScenarios,
      cost_analysis: {
        lowest_cost: testScenarios.filter(s => s.recommended.costLevel === 'low'),
        medium_cost: testScenarios.filter(s => s.recommended.costLevel === 'medium'),
        highest_cost: testScenarios.filter(s => s.recommended.costLevel === 'high')
      },
      provider_distribution: {
        siliconflow: testScenarios.filter(s => s.recommended.provider === 'siliconflow').length,
        openai: testScenarios.filter(s => s.recommended.provider === 'openai').length,
        other: testScenarios.filter(s => !['siliconflow', 'openai'].includes(s.recommended.provider)).length
      },
      recommendations: {
        best_for_cost: 'deepseek-chat (数学) 和 glm-4-9b-chat (通用)',
        best_for_quality: 'claude-3.5-sonnet (长文档) 和 gpt-4o-mini (英语)',
        best_for_speed: 'glm-4-9b-chat (通用快速任务)',
        specialized_models: {
          math: 'deepseek-math',
          coding: 'deepseek-coder',
          chinese: 'glm-4-9b-chat',
          english: 'gpt-4o-mini'
        }
      }
    })
    
  } catch (error) {
    console.error('模型选择测试失败:', error)
    
    return NextResponse.json({
      success: false,
      error: 'MODEL_TEST_FAILED',
      message: error instanceof Error ? error.message : '模型选择测试失败'
    }, { status: 500 })
  }
}

/**
 * POST /api/ai/model-test
 * 批量测试模型性能
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { test_questions = [] } = body
    
    const results = []
    
    for (const testCase of test_questions) {
      const { question, type, subject } = testCase
      
      try {
        const selectedModel = getModelForTaskType(type, subject)
        
        results.push({
          question,
          type,
          subject,
          selectedModel,
          success: true
        })
        
      } catch (error) {
        results.push({
          question,
          type,
          subject,
          selectedModel: null,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        })
      }
    }
    
    const summary = {
      total_tests: results.length,
      successful: results.filter(r => r.success).length,
      failed: results.filter(r => !r.success).length,
      model_distribution: {}
    }
    
    // 统计模型分布
    for (const result of results.filter(r => r.success)) {
      const model = result.selectedModel?.model || 'unknown'
      summary.model_distribution[model] = (summary.model_distribution[model] || 0) + 1
    }
    
    return NextResponse.json({
      success: true,
      results,
      summary,
      timestamp: new Date().toISOString()
    })
    
  } catch (error) {
    console.error('批量模型测试失败:', error)
    
    return NextResponse.json({
      success: false,
      error: 'BATCH_MODEL_TEST_FAILED',
      message: error instanceof Error ? error.message : '批量模型测试失败'
    }, { status: 500 })
  }
}