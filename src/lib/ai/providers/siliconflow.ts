import { AiClient, AiGenerationResult } from '../types'

/**
 * SiliconFlow AI 提供者
 * 支持多种模型，网络连接稳定，成本优化
 */
export class SiliconFlowProvider implements AiClient {
  private apiKey: string
  private baseUrl: string
  private model: string
  private maxTokens: number
  private temperature: number
  private timeoutMs: number

  constructor(config: {
    apiKey: string
    model?: string
    baseUrl?: string
    maxTokens?: number
    temperature?: number
    timeoutMs?: number
  }) {
    this.apiKey = config.apiKey
    this.model = config.model || 'THUDM/glm-4-9b-chat'
    this.baseUrl = config.baseUrl || 'https://api.siliconflow.cn/v1'
    this.maxTokens = config.maxTokens || 900
    this.temperature = config.temperature || 0.2
    this.timeoutMs = config.timeoutMs || 30000
  }

  async generateAnswer(input: {
    normalizedPrompt: string
    targetLang: string
    systemPrompt: string
    questionText?: string
    model?: string // 允许动态指定模型
    imageData?: string // 支持图片数据输入
  }): Promise<AiGenerationResult> {
    const startTime = Date.now()

    try {
      // 使用指定的模型或默认模型
      const modelToUse = input.model || this.model

      // 构建请求
      const response = await this.makeCompletionRequest(
        input.systemPrompt, 
        input.normalizedPrompt,
        modelToUse,
        input.targetLang,
        input.imageData // 传递图片数据
      )

      if (!response.success) {
        return {
          success: false,
          error: 'API_ERROR',
          message: response.error || 'SiliconFlow API调用失败',
          details: {
            provider: 'siliconflow',
            model: modelToUse,
            response_time_ms: Date.now() - startTime
          }
        }
      }

      const responseTime = Date.now() - startTime

      return {
        success: true,
        data: response.data!,
        details: {
          provider: 'siliconflow',
          model: modelToUse,
          response_time_ms: responseTime,
          tokens_used: response.usage?.total_tokens || 0,
          cost_estimate: this.estimateCost(modelToUse, response.usage?.total_tokens || 0)
        }
      }

    } catch (error) {
      console.error('SiliconFlow API调用出错:', error)
      
      return {
        success: false,
        error: 'NETWORK_ERROR',
        message: error instanceof Error ? error.message : 'SiliconFlow网络连接失败',
        details: {
          provider: 'siliconflow',
          model: input.model || this.model,
          response_time_ms: Date.now() - startTime
        }
      }
    }
  }

    private async makeCompletionRequest(
    systemPrompt: string,
    userPrompt: string,
    model: string,
    targetLang: string = 'zh',
    imageData?: string
  ): Promise<{
    success: boolean
    data?: any
    error?: string
    usage?: { total_tokens: number; prompt_tokens: number; completion_tokens: number }
  }> {
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), this.timeoutMs)

      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        signal: controller.signal,
        body: JSON.stringify({
          model: model,
          messages: [
            {
              role: 'system',
              content: systemPrompt
            },
            // 构建用户消息，支持图片
            imageData ? {
              role: 'user',
              content: [
                {
                  type: 'text',
                  text: userPrompt
                },
                {
                  type: 'image_url',
                  image_url: {
                    url: imageData
                  }
                }
              ]
            } : {
              role: 'user', 
              content: userPrompt
            }
          ],
          max_tokens: this.maxTokens,
          temperature: this.temperature,
          stream: false
        })
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        const errorText = await response.text()
        console.error(`SiliconFlow API错误 ${response.status}:`, errorText)
        
        return {
          success: false,
          error: `HTTP ${response.status}: ${errorText}`
        }
      }

      const data = await response.json()

      if (!data.choices || !data.choices[0] || !data.choices[0].message) {
        return {
          success: false,
          error: 'SiliconFlow返回格式无效'
        }
      }

      const content = data.choices[0].message.content
      
      // 尝试解析JSON响应
      let parsedContent
      try {
        parsedContent = JSON.parse(content)
      } catch (e) {
        // 如果不是JSON，包装成标准格式
        parsedContent = {
          language: targetLang || 'zh',
          question_type: 'unknown',
          answer: content,
          explanation: content, // 如果没有单独的解释，使用答案作为解释
          confidence: 0.9,
          flashcards: []
        }
      }

      // 确保所有必需字段都存在（即使JSON解析成功）
      if (parsedContent && typeof parsedContent === 'object') {
        parsedContent = {
          language: parsedContent.language || targetLang || 'zh',
          question_type: parsedContent.question_type || 'unknown',
          answer: parsedContent.answer || content,
          explanation: parsedContent.explanation || parsedContent.answer || content,
          confidence: parsedContent.confidence || 0.9,
          flashcards: parsedContent.flashcards || []
        }
      }

      return {
        success: true,
        data: parsedContent,
        usage: data.usage
      }

    } catch (error) {
      console.error('SiliconFlow请求出错:', error)
      
      if (error instanceof Error && error.name === 'AbortError') {
        return {
          success: false,
          error: `请求超时 (${this.timeoutMs}ms)`
        }
      }

      return {
        success: false,
        error: error instanceof Error ? error.message : '未知错误'
      }
    }
  }

  /**
   * 估算成本（基于模型和token数量）
   */
  private estimateCost(model: string, tokens: number): number {
    // SiliconFlow 的大概价格（每1000 tokens，单位：分）
    const priceMap: Record<string, number> = {
      'THUDM/glm-4-9b-chat': 0.1,                    // 最便宜
      'Qwen/Qwen2.5-7B-Instruct': 0.2,               // 便宜
      'Qwen/Qwen2.5-Coder-7B-Instruct': 0.2,         // 编程专用，便宜
      'Qwen/Qwen2.5-14B-Instruct': 0.5,              // 中等价格
      'Qwen/Qwen2.5-32B-Instruct': 1.0,              // 较贵但性能好
      'Qwen/Qwen2.5-72B-Instruct': 2.0,              // 最强但最贵
      'Qwen/Qwen2-7B-Instruct': 0.15,                // 便宜
      'internlm/internlm2_5-7b-chat': 0.2,           // 书生模型
      'moonshotai/Kimi-K2-Instruct': 1.5,            // Kimi模型
    }

    const pricePerK = priceMap[model] || 0.5 // 默认价格
    return Math.round((tokens / 1000) * pricePerK)
  }

  /**
   * 检查模型是否可用
   */
  async checkModelAvailability(model: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/models`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
        },
      })

      if (!response.ok) {
        return false
      }

      const data = await response.json()
      return data.data?.some((m: any) => m.id === model) || false

    } catch (error) {
      console.error('检查模型可用性失败:', error)
      return false
    }
  }

  /**
   * 获取所有可用模型
   */
  async getAvailableModels(): Promise<string[]> {
    try {
      const response = await fetch(`${this.baseUrl}/models`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
        },
      })

      if (!response.ok) {
        return []
      }

      const data = await response.json()
      return data.data?.map((model: any) => model.id) || []

    } catch (error) {
      console.error('获取可用模型失败:', error)
      return []
    }
  }
}