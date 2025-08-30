/**
 * DeepSeek provider implementation
 */

import { AnswerSchemaType, validateAIResponse } from '../schema'
import { AiClient, AiGenerationResult } from './types'

export class DeepSeekProvider implements AiClient {
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
    this.model = config.model || 'deepseek-chat'
    this.baseUrl = config.baseUrl || 'https://api.deepseek.com/v1'
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
      // DeepSeek doesn't have built-in moderation, so we skip that step
      // or implement basic keyword filtering if needed

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
          provider: 'deepseek'
        }
      }

    } catch (error) {
      return {
        success: false,
        error: 'SERVER',
        message: error instanceof Error ? error.message : 'Unknown error occurred',
        details: { provider: 'deepseek', processingTimeMs: Date.now() - startTime }
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
      // Add JSON format instruction to the system prompt for DeepSeek
      const enhancedSystemPrompt = `${systemPrompt}\n\nIMPORTANT: Respond with valid JSON only. No markdown, no code blocks, no additional text.`

      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: this.model,
          messages: [
            { role: 'system', content: enhancedSystemPrompt },
            { role: 'user', content: userPrompt }
          ],
          max_tokens: this.maxTokens,
          temperature: this.temperature,
          stream: false
        }),
        signal: controller.signal
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        
        // Handle specific DeepSeek error codes
        if (response.status === 429) {
          return {
            success: false,
            error: 'RATE_LIMIT',
            message: 'Rate limit exceeded for DeepSeek API'
          }
        }

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
          message: 'No response choices returned from DeepSeek'
        }
      }

      let content = data.choices[0].message?.content
      if (!content) {
        return {
          success: false,
          error: 'SERVER',
          message: 'Empty response content from DeepSeek'
        }
      }

      // Clean up the response - DeepSeek sometimes wraps JSON in markdown
      content = this.cleanJsonResponse(content)

      let parsedContent: any
      try {
        parsedContent = JSON.parse(content)
      } catch (parseError) {
        return {
          success: false,
          error: 'INVALID',
          message: 'Failed to parse JSON response from DeepSeek'
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

  private cleanJsonResponse(content: string): string {
    // Remove markdown code blocks if present
    content = content.replace(/```json\s*\n?/g, '').replace(/```\s*$/g, '')
    
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

  private calculateCost(tokens: number): number {
    // DeepSeek pricing: approximately $0.14 per 1M tokens (rough estimate)
    // This is much cheaper than OpenAI
    const costPer1M = 0.14
    return Math.ceil((tokens / 1000000) * costPer1M * 100) // Convert to cents
  }

  async testConnection(): Promise<{ success: boolean; message: string }> {
    try {
      // DeepSeek API doesn't have a models endpoint, so we make a simple chat request
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: this.model,
          messages: [
            { role: 'user', content: 'Hello' }
          ],
          max_tokens: 10
        })
      })

      if (response.ok) {
        return { success: true, message: 'DeepSeek connection successful' }
      } else {
        const errorData = await response.json().catch(() => ({}))
        return { 
          success: false, 
          message: errorData.error?.message || `HTTP ${response.status}: ${response.statusText}` 
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
      provider: 'deepseek',
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