/**
 * QuizMate 智能AI路由器
 * 根据问题类型和学科自动选择最适合的AI模型
 */

import { AiClient, AiGenerationResult } from './types'
import { createAIProvider, ProviderType } from './index'
import { getModelForTaskType, ModelConfig } from '../../config/modelConfig'

export interface SmartGenerationInput {
  normalizedPrompt: string
  targetLang: string
  systemPrompt: string
  questionText?: string
  questionType?: string
  subject?: string
  imageData?: string // 支持图片数据输入
}

export interface SmartGenerationResult extends AiGenerationResult {
  selectedModel?: {
    model: string
    provider: string
    reason: string
    costLevel: string
  }
}

/**
 * 智能AI路由器类
 */
export class SmartAIRouter {
  private providers: Map<string, AiClient> = new Map()
  private fallbackProvider: AiClient

  constructor() {
    // 初始化SiliconFlow提供者作为主要和备用提供者
    this.initializeProviders()
    
    // 设置备用提供者
    this.fallbackProvider = this.getSiliconFlowProvider()
  }

  private initializeProviders() {
    try {
      // 只初始化SiliconFlow提供者（避免其他提供者的网络问题）
      const siliconflowProvider = this.getSiliconFlowProvider()
      this.providers.set('siliconflow', siliconflowProvider)
      
    } catch (error) {
      console.warn('初始化AI提供者时出错:', error)
    }
  }

  private getSiliconFlowProvider(): AiClient {
    return createAIProvider({
      provider: 'siliconflow' as ProviderType,
      apiKey: process.env.SILICONFLOW_API_KEY || '',
      baseUrl: process.env.SILICONFLOW_BASE_URL || 'https://api.siliconflow.cn/v1',
      maxTokens: 900,
      temperature: 0.2,
      timeoutMs: 30000
    })
  }

  /**
   * 智能生成答案
   */
  async generateAnswer(input: SmartGenerationInput): Promise<SmartGenerationResult> {
    const startTime = Date.now()

    try {
      // 1. 根据问题类型和学科选择最适合的模型
      const selectedModelConfig = this.selectBestModel(input.questionType, input.subject)
      
      // 2. 获取对应的提供者
      const provider = this.getProvider(selectedModelConfig.provider)
      
      if (!provider) {
        throw new Error(`Provider ${selectedModelConfig.provider} not available`)
      }

      // 3. 调用AI生成答案（传入指定的模型）
      const result = await provider.generateAnswer({
        ...input,
        model: selectedModelConfig.model, // 传入指定模型
        imageData: input.imageData // 传递图片数据
      })

      // 4. 增强结果信息
      const enhancedResult: SmartGenerationResult = {
        ...result,
        selectedModel: {
          model: selectedModelConfig.model,
          provider: selectedModelConfig.provider,
          reason: `选择理由: ${selectedModelConfig.description}`,
          costLevel: selectedModelConfig.costLevel
        }
      }

      // 5. 如果失败，尝试备用方案
      if (!result.success) {
        console.warn(`主模型 ${selectedModelConfig.model} 失败，尝试备用方案...`)
        return await this.tryFallback(input, selectedModelConfig)
      }

      return enhancedResult

    } catch (error) {
      console.error('智能路由器生成答案失败:', error)
      
      // 尝试备用方案
      return await this.tryFallback(input)
    }
  }

  /**
   * 选择最适合的模型
   */
  private selectBestModel(questionType?: string, subject?: string): ModelConfig {
    try {
      // 使用配置文件中的智能选择逻辑
      return getModelForTaskType(questionType || 'general', subject)
      
    } catch (error) {
      console.warn('模型选择失败，使用默认模型:', error)
      
      // 默认返回多模态通用模型
      return {
        model: 'Pro/Qwen/Qwen2.5-VL-7B-Instruct',
        provider: 'siliconflow',
        description: '多模态通用模型（默认选择）',
        costLevel: 'medium' as const,
        strengths: ['通用对话', '图片识别', '视觉理解', '基础问答']
      }
    }
  }

  /**
   * 获取提供者实例
   */
  private getProvider(providerName: string): AiClient | null {
    return this.providers.get(providerName) || null
  }

  /**
   * 备用方案
   */
  private async tryFallback(
    input: SmartGenerationInput, 
    failedModel?: ModelConfig
  ): Promise<SmartGenerationResult> {
    try {
      console.log('尝试备用模型...')
      
      // 选择不同的备用模型
      let fallbackModelConfig: ModelConfig
      
      if (failedModel?.model === 'Pro/Qwen/Qwen2.5-VL-7B-Instruct') {
        // 如果Pro版本失败，尝试32B版本
        fallbackModelConfig = {
          model: 'Qwen/Qwen2.5-VL-32B-Instruct',
          provider: 'siliconflow',
          description: '备用模型 - Qwen2.5-VL-32B（最强VLM）',
          costLevel: 'high' as const,
          strengths: ['图片识别', '视觉理解', '数学推理', '复杂分析']
        }
      } else if (failedModel?.model === 'Qwen/Qwen2.5-VL-32B-Instruct') {
        // 如果32B失败，尝试GLM系列
        fallbackModelConfig = {
          model: 'THUDM/GLM-4.1V-9B-Thinking',
          provider: 'siliconflow',
          description: '备用模型 - GLM-4.1V（支持图片+思维链）',
          costLevel: 'medium' as const,
          strengths: ['思维推理', '图片识别', '逻辑分析']
        }
      } else {
        // 默认备用到Pro版本
        fallbackModelConfig = {
          model: 'Pro/Qwen/Qwen2.5-VL-7B-Instruct',
          provider: 'siliconflow',
          description: '备用模型 - Pro/Qwen2.5-VL-7B（支持图片）',
          costLevel: 'medium' as const,
          strengths: ['通用对话', '图片识别', '视觉理解']
        }
      }

      const result = await this.fallbackProvider.generateAnswer({
        ...input,
        model: fallbackModelConfig.model,
        imageData: input.imageData // 确保传递图片数据
      })

      return {
        ...result,
        selectedModel: {
          model: fallbackModelConfig.model,
          provider: fallbackModelConfig.provider,
          reason: `备用方案: ${fallbackModelConfig.description}`,
          costLevel: fallbackModelConfig.costLevel
        }
      }

    } catch (fallbackError) {
      console.error('备用方案也失败了:', fallbackError)
      
      return {
        success: false,
        error: 'COMPLETE_FAILURE',
        message: '所有AI模型都不可用，请稍后重试',
        details: {
          provider: 'fallback',
          model: 'unknown',
          response_time_ms: 0
        }
      }
    }
  }

  /**
   * 检查服务健康状态
   */
  async checkHealth(): Promise<{
    healthy: boolean
    providers: Array<{ name: string; status: string; model?: string }>
  }> {
    const results = []
    
    for (const [name, provider] of this.providers) {
      try {
        // 简单的健康检查调用
        const testResult = await provider.generateAnswer({
          normalizedPrompt: 'Hello',
          targetLang: 'zh',
          systemPrompt: 'You are a helpful assistant.',
          model: 'THUDM/glm-4-9b-chat' // 使用最便宜的模型进行健康检查
        })
        
        results.push({
          name,
          status: testResult.success ? 'healthy' : 'error',
          model: 'THUDM/glm-4-9b-chat'
        })
        
      } catch (error) {
        results.push({
          name,
          status: 'error',
          model: 'unknown'
        })
      }
    }
    
    const healthy = results.some(r => r.status === 'healthy')
    
    return {
      healthy,
      providers: results
    }
  }

  /**
   * 获取模型使用统计
   */
  getModelStats(): {
    totalProviders: number
    availableModels: string[]
    recommendedForTask: (taskType: string, subject?: string) => ModelConfig
  } {
    return {
      totalProviders: this.providers.size,
      availableModels: [
        'THUDM/glm-4-9b-chat',
        'Qwen/Qwen2.5-7B-Instruct',
        'Qwen/Qwen2.5-14B-Instruct',
        'Qwen/Qwen2.5-32B-Instruct',
        'Qwen/Qwen2.5-72B-Instruct',
        'Qwen/Qwen2.5-Coder-7B-Instruct'
      ],
      recommendedForTask: (taskType: string, subject?: string) => 
        this.selectBestModel(taskType, subject)
    }
  }
}

/**
 * 创建智能AI路由器单例
 */
let smartRouterInstance: SmartAIRouter | null = null

export function getSmartAIRouter(): SmartAIRouter {
  if (!smartRouterInstance) {
    smartRouterInstance = new SmartAIRouter()
  }
  return smartRouterInstance
}