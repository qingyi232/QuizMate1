/**
 * Qwen (通义千问) provider implementation
 */

import { AnswerSchemaType, validateAIResponse } from '../schema'
import { AiClient, AiGenerationResult } from './types'

export class QwenProvider implements AiClient {
  private apiKey: string
  private model: string
  private baseUrl: string
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
    this.model = config.model || 'qwen-turbo'
    this.baseUrl = config.baseUrl || 'https://dashscope.aliyuncs.com/api/v1'
    this.maxTokens = config.maxTokens || 900
    this.temperature = config.temperature || 0.2
    this.timeoutMs = config.timeoutMs || 30000
  }

  async generateAnswer(input: {
    normalizedPrompt: string
    targetLang: string
    systemPrompt: string
    questionText?: string
  }): Promise<AiGenerationResult> {
    const startTime = Date.now()

    try {
      // Basic content filtering for Chinese regulations
      const contentCheck = this.basicContentFilter(input.questionText || input.normalizedPrompt)
      if (!contentCheck.allowed) {
        return {
          success: false,
          error: 'MODERATION',
          message: contentCheck.reason || 'Content not allowed',
          details: { provider: 'qwen' }
        }
      }

      const response = await this.makeCompletionRequest(input.systemPrompt, input.normalizedPrompt)
      const processingTime = Date.now() - startTime

      if (!response.success) {
        return response
      }

      // Validate the AI response against our schema
      const validation = validateAIResponse(response.data)
      
      if (!validation.success) {
        return {
          success: false,
          error: 'INVALID',
          message: 'AI response does not match expected format',
          details: { errors: validation.errors }
        }
      }

      return {
        success: true,
        data: validation.data,
        metadata: {
          model: this.model,
          tokens: response.metadata?.tokensUsed || 0,
          costCents: this.calculateCost(response.metadata?.tokensUsed || 0),
          processingTimeMs: processingTime,
          provider: 'qwen'
        }
      }

    } catch (error) {
      return {
        success: false,
        error: 'SERVER',
        message: error instanceof Error ? error.message : 'Unknown error occurred',
        details: { provider: 'qwen', processingTimeMs: Date.now() - startTime }
      }
    }
  }

  private async makeCompletionRequest(
    systemPrompt: string, 
    userPrompt: string
  ): Promise<{ success: true; data: any; metadata?: { tokensUsed: number } } | { success: false; error: string; message: string }> {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), this.timeoutMs)

    try {
      // Qwen API uses a different format than OpenAI
      const response = await fetch(`${this.baseUrl}/services/aigc/text-generation/generation`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
          'X-DashScope-SSE': 'disable' // Disable server-sent events
        },
        body: JSON.stringify({
          model: this.model,
          input: {
            messages: [
              { role: 'system', content: `${systemPrompt}\n\n请用JSON格式回复，不要包含任何其他文本。` },
              { role: 'user', content: userPrompt }
            ]
          },
          parameters: {
            max_tokens: this.maxTokens,
            temperature: this.temperature,
            result_format: 'message'
          }
        }),
        signal: controller.signal
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        
        // Handle specific Qwen error codes
        if (response.status === 429) {
          return {
            success: false,
            error: 'RATE_LIMIT',
            message: 'Rate limit exceeded for Qwen API'
          }
        }

        if (response.status === 400 && errorData.code === 'InvalidParameter') {
          return {
            success: false,
            error: 'INVALID',
            message: 'Invalid parameters sent to Qwen API'
          }
        }

        return {
          success: false,
          error: 'SERVER',
          message: errorData.message || `HTTP ${response.status}: ${response.statusText}`
        }
      }

      const data = await response.json()
      
      // Qwen API response format is different
      if (data.output?.choices && data.output.choices.length > 0) {
        let content = data.output.choices[0].message?.content
        
        if (!content) {
          return {
            success: false,
            error: 'SERVER',
            message: 'Empty response content from Qwen'
          }
        }

        // Clean up the response - Qwen sometimes includes extra text
        content = this.cleanJsonResponse(content)

        let parsedContent: any
        try {
          parsedContent = JSON.parse(content)
        } catch (parseError) {
          return {
            success: false,
            error: 'INVALID',
            message: 'Failed to parse JSON response from Qwen'
          }
        }

        return {
          success: true,
          data: parsedContent,
          metadata: {
            tokensUsed: data.usage?.total_tokens || 0
          }
        }
      } else {
        return {
          success: false,
          error: 'SERVER',
          message: 'No valid response from Qwen API'
        }
      }

    } catch (error) {
      clearTimeout(timeoutId)
      
      if (error instanceof Error && error.name === 'AbortError') {
        return {
          success: false,
          error: 'TIMEOUT',
          message: `Request timed out after ${this.timeoutMs}ms`
        }
      }

      return {
        success: false,
        error: 'SERVER',
        message: error instanceof Error ? error.message : 'Network error'
      }
    }
  }

  private cleanJsonResponse(content: string): string {
    // Remove any Chinese explanatory text or markdown
    content = content.replace(/```json\s*\n?/g, '').replace(/```\s*$/g, '')
    content = content.replace(/以下是JSON格式的回复：?\s*/g, '')
    content = content.replace(/这是JSON格式的回复：?\s*/g, '')
    
    // Remove any leading/trailing whitespace
    content = content.trim()
    
    // If content doesn't start with {, try to find the JSON part
    if (!content.startsWith('{')) {
      const jsonMatch = content.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        content = jsonMatch[0]
      }
    }
    
    return content
  }

  private basicContentFilter(content: string): { allowed: boolean; reason?: string } {
    // Basic content filtering for compliance with Chinese regulations
    const restrictedKeywords = [
      // Political sensitive terms would go here
      // For now, we'll just check for obviously inappropriate content
      'violence', 'illegal', 'drugs', 'weapons'
    ]

    const lowerContent = content.toLowerCase()
    
    for (const keyword of restrictedKeywords) {
      if (lowerContent.includes(keyword)) {
        return {
          allowed: false,
          reason: `Content contains restricted keyword: ${keyword}`
        }
      }
    }

    return { allowed: true }
  }

  private calculateCost(tokens: number): number {
    // Qwen pricing varies by model, roughly $0.002 per 1K tokens for qwen-turbo
    let costPer1K = 0.002
    
    if (this.model.includes('plus')) {
      costPer1K = 0.008 // qwen-plus is more expensive
    } else if (this.model.includes('max')) {
      costPer1K = 0.02 // qwen-max is most expensive
    }
    
    return Math.ceil((tokens / 1000) * costPer1K * 100) // Convert to cents
  }

  async testConnection(): Promise<{ success: boolean; message: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/services/aigc/text-generation/generation`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: this.model,
          input: {
            messages: [
              { role: 'user', content: 'Hello' }
            ]
          },
          parameters: {
            max_tokens: 10
          }
        })
      })

      if (response.ok) {
        return { success: true, message: 'Qwen connection successful' }
      } else {
        const errorData = await response.json().catch(() => ({}))
        return { 
          success: false, 
          message: errorData.message || `HTTP ${response.status}: ${response.statusText}` 
        }
      }
    } catch (error) {
      return { 
        success: false, 
        message: error instanceof Error ? error.message : 'Connection test failed' 
      }
    }
  }

  getModelInfo(): { provider: string; model: string; maxTokens: number } {
    return {
      provider: 'qwen',
      model: this.model,
      maxTokens: this.maxTokens
    }
  }

  async estimateCost(inputLength: number): Promise<number> {
    // Rough estimation: 2-3 characters per token for Chinese, 4 for English
    const estimatedTokens = Math.ceil(inputLength / 3) + this.maxTokens
    return this.calculateCost(estimatedTokens)
  }
}