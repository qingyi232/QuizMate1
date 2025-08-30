/**
 * AI健康检查API
 * 检查SiliconFlow和其他AI服务的可用性
 */

import { NextRequest, NextResponse } from 'next/server'
import { getSmartAIRouter } from '@/lib/ai/smartRouter'

/**
 * GET /api/ai/health
 * 检查AI服务健康状态
 */
export async function GET(request: NextRequest) {
  try {
    const startTime = Date.now()
    
    // 获取智能路由器
    const smartRouter = getSmartAIRouter()
    
    // 执行健康检查
    const healthResult = await smartRouter.checkHealth()
    
    // 获取模型统计信息
    const modelStats = smartRouter.getModelStats()
    
    const responseTime = Date.now() - startTime
    
    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      response_time_ms: responseTime,
      ai_services: {
        overall_healthy: healthResult.healthy,
        providers: healthResult.providers,
        stats: {
          total_providers: modelStats.totalProviders,
          available_models: modelStats.availableModels,
          default_provider: process.env.AI_PROVIDER || 'siliconflow'
        }
      },
      environment: {
        siliconflow_configured: !!process.env.SILICONFLOW_API_KEY,
        openai_configured: !!process.env.OPENAI_API_KEY,
        base_url: process.env.SILICONFLOW_BASE_URL || 'https://api.siliconflow.cn/v1'
      },
      recommendations: {
        math_tasks: modelStats.recommendedForTask('math').model,
        language_tasks: modelStats.recommendedForTask('language').model,
        coding_tasks: modelStats.recommendedForTask('coding').model,
        general_tasks: modelStats.recommendedForTask('general').model
      }
    })
    
  } catch (error) {
    console.error('AI健康检查失败:', error)
    
    return NextResponse.json({
      success: false,
      error: 'HEALTH_CHECK_FAILED',
      message: error instanceof Error ? error.message : '健康检查失败',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}

/**
 * POST /api/ai/health
 * 执行深度健康检查（实际调用AI服务）
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { test_prompt = '你好', target_lang = 'zh' } = body
    
    const startTime = Date.now()
    
    // 获取智能路由器
    const smartRouter = getSmartAIRouter()
    
    // 执行实际的AI调用测试
    const testResult = await smartRouter.generateAnswer({
      normalizedPrompt: test_prompt,
      targetLang: target_lang,
      systemPrompt: 'You are a helpful AI assistant. Please respond briefly.',
      questionType: 'general'
    })
    
    const responseTime = Date.now() - startTime
    
    if (testResult.success) {
      return NextResponse.json({
        success: true,
        test_successful: true,
        response_time_ms: responseTime,
        selected_model: testResult.selectedModel,
        ai_response: testResult.data,
        usage: {
          tokens_used: testResult.details?.tokens_used || 0,
          cost_estimate: testResult.details?.cost_estimate || 0
        }
      })
    } else {
      return NextResponse.json({
        success: false,
        test_successful: false,
        response_time_ms: responseTime,
        error: testResult.error,
        message: testResult.message,
        details: testResult.details
      }, { status: 500 })
    }
    
  } catch (error) {
    console.error('AI深度健康检查失败:', error)
    
    return NextResponse.json({
      success: false,
      test_successful: false,
      error: 'DEEP_HEALTH_CHECK_FAILED',
      message: error instanceof Error ? error.message : '深度健康检查失败'
    }, { status: 500 })
  }
}