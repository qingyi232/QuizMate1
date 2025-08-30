/**
 * Type definitions for AI providers
 */

import { AnswerSchemaType } from '../schema'

/**
 * AI generation result type
 */
export type AiGenerationResult = 
  | {
      success: true
      data: AnswerSchemaType
      metadata?: {
        model?: string
        tokens?: number
        costCents?: number
        processingTimeMs?: number
        provider?: string
      }
    }
  | {
      success: false
      error: 'MODERATION' | 'INVALID' | 'SERVER' | 'TIMEOUT' | 'QUOTA' | 'RATE_LIMIT'
      message: string
      details?: Record<string, any>
    }

/**
 * AI provider interface
 */
export interface AiClient {
  /**
   * Generate an answer for the given prompt
   */
  generateAnswer(input: {
    normalizedPrompt: string
    targetLang: string
    systemPrompt: string
    questionText?: string
  }): Promise<AiGenerationResult>

  /**
   * Test the connection to the AI provider
   */
  testConnection(): Promise<{ success: boolean; message: string }>

  /**
   * Get information about the current model
   */
  getModelInfo(): { provider: string; model: string; maxTokens: number }

  /**
   * Estimate the cost for a given input length
   */
  estimateCost(inputLength: number): Promise<number>
}

/**
 * Provider configuration base type
 */
export interface BaseProviderConfig {
  apiKey: string
  model?: string
  baseUrl?: string
  maxTokens?: number
  temperature?: number
  timeoutMs?: number
}

/**
 * OpenAI specific configuration
 */
export interface OpenAIConfig extends BaseProviderConfig {
  provider: 'openai'
  model?: 'gpt-4o-mini' | 'gpt-4o' | 'gpt-3.5-turbo'
}

/**
 * DeepSeek specific configuration
 */
export interface DeepSeekConfig extends BaseProviderConfig {
  provider: 'deepseek'
  model?: 'deepseek-chat' | 'deepseek-coder'
}

/**
 * Qwen specific configuration
 */
export interface QwenConfig extends BaseProviderConfig {
  provider: 'qwen'
  model?: 'qwen-turbo' | 'qwen-plus' | 'qwen-max'
}

/**
 * Union type for all provider configurations
 */
export type ProviderConfig = OpenAIConfig | DeepSeekConfig | QwenConfig

/**
 * Provider factory interface
 */
export interface ProviderFactory {
  createProvider(config: ProviderConfig): AiClient
  getSupportedProviders(): string[]
  getDefaultConfig(provider: string): Partial<BaseProviderConfig>
}

/**
 * Model capabilities
 */
export interface ModelCapabilities {
  maxTokens: number
  supportsJson: boolean
  supportsSystemPrompts: boolean
  costPer1MTokens: number
  supportedLanguages: string[]
  provider: string
}

/**
 * Provider status
 */
export interface ProviderStatus {
  name: string
  available: boolean
  lastChecked: Date
  responseTime?: number
  error?: string
}

/**
 * Batch processing options
 */
export interface BatchOptions {
  maxConcurrent?: number
  retryAttempts?: number
  delayBetweenRequests?: number
  failFast?: boolean
}

/**
 * Streaming response types for future implementation
 */
export interface StreamingResponse {
  id: string
  chunk: string
  done: boolean
  metadata?: Record<string, any>
}

export type StreamingCallback = (response: StreamingResponse) => void

/**
 * Error types for better error handling
 */
export class AIProviderError extends Error {
  constructor(
    message: string,
    public code: AiGenerationResult['error'],
    public provider: string,
    public details?: Record<string, any>
  ) {
    super(message)
    this.name = 'AIProviderError'
  }
}

export class RateLimitError extends AIProviderError {
  constructor(
    message: string,
    provider: string,
    public retryAfter?: number
  ) {
    super(message, 'RATE_LIMIT', provider)
    this.name = 'RateLimitError'
  }
}

export class QuotaExceededError extends AIProviderError {
  constructor(
    message: string,
    provider: string,
    public quotaType: 'daily' | 'monthly' | 'credits'
  ) {
    super(message, 'QUOTA', provider)
    this.name = 'QuotaExceededError'
  }
}

/**
 * Usage statistics
 */
export interface UsageStats {
  provider: string
  model: string
  requestCount: number
  totalTokens: number
  totalCostCents: number
  averageResponseTime: number
  errorRate: number
  lastUsed: Date
}

/**
 * Provider comparison metrics
 */
export interface ProviderMetrics {
  accuracy: number // 0-1 score based on validation
  speed: number // Average response time in ms
  cost: number // Cost per request in cents
  reliability: number // 0-1 score based on error rate
  features: string[] // Supported features
}

/**
 * Content filter result
 */
export interface ContentFilterResult {
  allowed: boolean
  reason?: string
  confidence: number
  categories?: string[]
}

/**
 * Provider health check
 */
export interface HealthCheck {
  provider: string
  status: 'healthy' | 'degraded' | 'unavailable'
  responseTime: number
  lastCheck: Date
  issues?: string[]
}