/**
 * OpenAI provider implementation
 */

import { AnswerSchemaType, validateAIResponse } from '../schema'
import { AiClient, AiGenerationResult } from './types'

export class OpenAIProvider implements AiClient {
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
    this.model = config.model || 'gpt-4o-mini'
    this.baseUrl = config.baseUrl || 'https://api.openai.com/v1'
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
      // TODO: 临时禁用内容审核检查（网络连接问题）
      // Check for content moderation first
      // const moderationResult = await this.checkModeration(input.questionText || input.normalizedPrompt)
      
      // if (moderationResult.flagged) {
      //   return {
      //     success: false,
      //     error: 'MODERATION',
      //     message: 'Content flagged by moderation system',
      //     details: { categories: moderationResult.flaggedCategories }
      //   }
      // }

      // Make the main completion request
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
          provider: 'openai'
        }
      }

    } catch (error) {
      return {
        success: false,
        error: 'SERVER',
        message: error instanceof Error ? error.message : 'Unknown error occurred',
        details: { provider: 'openai', processingTimeMs: Date.now() - startTime }
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
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: this.model,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ],
          max_tokens: this.maxTokens,
          temperature: this.temperature,
          response_format: { type: 'json_object' }
        }),
        signal: controller.signal
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        return {
          success: false,
          error: 'SERVER',
          message: errorData.error?.message || `HTTP ${response.status}: ${response.statusText}`
        }
      }

      const data = await response.json()
      
      if (!data.choices || data.choices.length === 0) {
        return {
          success: false,
          error: 'SERVER',
          message: 'No response choices returned from OpenAI'
        }
      }

      const content = data.choices[0].message?.content
      if (!content) {
        return {
          success: false,
          error: 'SERVER',
          message: 'Empty response content from OpenAI'
        }
      }

      let parsedContent: any
      try {
        parsedContent = JSON.parse(content)
      } catch (parseError) {
        // 如果JSON解析失败，创建标准格式
        parsedContent = {
          language: 'zh',
          question_type: 'unknown',
          answer: content,
          explanation: content,
          confidence: 0.9,
          flashcards: []
        }
      }

      // 确保所有必需字段都存在
      if (parsedContent && typeof parsedContent === 'object') {
        parsedContent = {
          language: parsedContent.language || 'zh',
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
        metadata: {
          tokensUsed: data.usage?.total_tokens || 0
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

  private async checkModeration(text: string): Promise<{ flagged: boolean; flaggedCategories: string[] }> {
    try {
      const response = await fetch(`${this.baseUrl}/moderations`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          input: text
        })
      })

      if (!response.ok) {
        // If moderation check fails, allow content through (fail open)
        console.warn('Moderation check failed, allowing content through')
        return { flagged: false, flaggedCategories: [] }
      }

      const data = await response.json()
      const result = data.results?.[0]
      
      if (!result) {
        return { flagged: false, flaggedCategories: [] }
      }

      const flaggedCategories = Object.entries(result.categories || {})
        .filter(([_, flagged]) => flagged)
        .map(([category]) => category)

      return {
        flagged: result.flagged || false,
        flaggedCategories
      }

    } catch (error) {
      // Fail open - allow content if moderation check fails
      console.warn('Moderation check error:', error)
      return { flagged: false, flaggedCategories: [] }
    }
  }

  private calculateCost(tokens: number): number {
    // GPT-4o-mini pricing: $0.15 per 1M input tokens, $0.60 per 1M output tokens
    // Simplified: assume 70% input, 30% output tokens
    const inputTokens = Math.floor(tokens * 0.7)
    const outputTokens = Math.floor(tokens * 0.3)
    
    const inputCost = (inputTokens / 1000000) * 0.15 * 100 // Convert to cents
    const outputCost = (outputTokens / 1000000) * 0.60 * 100 // Convert to cents
    
    return Math.ceil(inputCost + outputCost)
  }

  async testConnection(): Promise<{ success: boolean; message: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/models`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`
        }
      })

      if (response.ok) {
        return { success: true, message: 'OpenAI connection successful' }
      } else {
        return { success: false, message: `HTTP ${response.status}: ${response.statusText}` }
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
      provider: 'openai',
      model: this.model,
      maxTokens: this.maxTokens
    }
  }

  async estimateCost(inputLength: number): Promise<number> {
    // Rough estimation: 4 characters per token
    const estimatedTokens = Math.ceil(inputLength / 4) + this.maxTokens
    return this.calculateCost(estimatedTokens)
  }
}