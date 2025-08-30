/**
 * AI provider factory and main interface
 */

import { OpenAIProvider } from './providers/openai'
import { DeepSeekProvider } from './providers/deepseek'
import { QwenProvider } from './providers/qwen'
import { SiliconFlowProvider } from './providers/siliconflow'
import { AiClient, ProviderConfig, BaseProviderConfig } from './providers/types'

/**
 * Supported AI providers
 */
export type ProviderType = 'openai' | 'deepseek' | 'qwen' | 'siliconflow'

/**
 * Create an AI provider instance based on configuration
 */
export function createAIProvider(config: ProviderConfig): AiClient {
  switch (config.provider) {
    case 'openai':
      return new OpenAIProvider({
        apiKey: config.apiKey,
        model: config.model || 'gpt-4o-mini',
        baseUrl: config.baseUrl,
        maxTokens: config.maxTokens || 900,
        temperature: config.temperature || 0.2,
        timeoutMs: config.timeoutMs || 30000
      })

    case 'deepseek':
      return new DeepSeekProvider({
        apiKey: config.apiKey,
        model: config.model || 'deepseek-chat',
        baseUrl: config.baseUrl,
        maxTokens: config.maxTokens || 900,
        temperature: config.temperature || 0.2,
        timeoutMs: config.timeoutMs || 30000
      })

    case 'qwen':
      return new QwenProvider({
        apiKey: config.apiKey,
        model: config.model || 'qwen-turbo',
        baseUrl: config.baseUrl,
        maxTokens: config.maxTokens || 900,
        temperature: config.temperature || 0.2,
        timeoutMs: config.timeoutMs || 30000
      })

    case 'siliconflow':
      return new SiliconFlowProvider({
        apiKey: config.apiKey,
        model: config.model || 'THUDM/glm-4-9b-chat',
        baseUrl: config.baseUrl || 'https://api.siliconflow.cn/v1',
        maxTokens: config.maxTokens || 900,
        temperature: config.temperature || 0.2,
        timeoutMs: config.timeoutMs || 30000
      })

    default:
      throw new Error(`Unsupported provider: ${(config as any).provider}`)
  }
}

/**
 * Get the default AI provider from environment variables
 */
export function getDefaultAIProvider(): AiClient {
  const provider = (process.env.AI_PROVIDER as ProviderType) || 'openai'
  
  const config: ProviderConfig = {
    provider,
    apiKey: getApiKey(provider),
    model: getDefaultModel(provider),
    maxTokens: parseInt(process.env.AI_MAX_TOKENS || '900', 10),
    temperature: parseFloat(process.env.AI_TEMPERATURE || '0.2'),
    timeoutMs: parseInt(process.env.AI_TIMEOUT_MS || '30000', 10)
  } as ProviderConfig

  return createAIProvider(config)
}

/**
 * Get API key for the specified provider
 */
function getApiKey(provider: ProviderType): string {
  const envKeys = {
    openai: 'OPENAI_API_KEY',
    deepseek: 'DEEPSEEK_API_KEY',
    qwen: 'QWEN_API_KEY',
    siliconflow: 'SILICONFLOW_API_KEY'
  }

  const apiKey = process.env[envKeys[provider]]
  
  if (!apiKey) {
    throw new Error(`API key not found for provider: ${provider}. Please set ${envKeys[provider]} environment variable.`)
  }

  return apiKey
}

/**
 * Get default model for each provider
 */
function getDefaultModel(provider: ProviderType): string {
  const defaultModels = {
    openai: process.env.MODEL_FREE || 'gpt-4o-mini',
    deepseek: 'deepseek-chat',
    qwen: 'qwen-turbo',
    siliconflow: process.env.SILICONFLOW_DEFAULT_MODEL || 'THUDM/glm-4-9b-chat'
  }

  return defaultModels[provider]
}

/**
 * Get provider-specific configuration defaults
 */
export function getProviderDefaults(provider: ProviderType): Partial<BaseProviderConfig> {
  const defaults = {
    openai: {
      baseUrl: 'https://api.openai.com/v1',
      maxTokens: 900,
      temperature: 0.2,
      timeoutMs: 30000
    },
    deepseek: {
      baseUrl: 'https://api.deepseek.com/v1',
      maxTokens: 900,
      temperature: 0.2,
      timeoutMs: 30000
    },
    qwen: {
      baseUrl: 'https://dashscope.aliyuncs.com/api/v1',
      maxTokens: 900,
      temperature: 0.2,
      timeoutMs: 30000
    }
  }

  return defaults[provider] || defaults.openai
}

/**
 * Validate provider configuration
 */
export function validateProviderConfig(config: ProviderConfig): { valid: boolean; errors: string[] } {
  const errors: string[] = []

  if (!config.apiKey || config.apiKey.trim().length === 0) {
    errors.push('API key is required')
  }

  if (!config.provider || !['openai', 'deepseek', 'qwen'].includes(config.provider)) {
    errors.push('Invalid provider. Must be one of: openai, deepseek, qwen')
  }

  if (config.maxTokens && (config.maxTokens < 1 || config.maxTokens > 4000)) {
    errors.push('Max tokens must be between 1 and 4000')
  }

  if (config.temperature && (config.temperature < 0 || config.temperature > 2)) {
    errors.push('Temperature must be between 0 and 2')
  }

  if (config.timeoutMs && config.timeoutMs < 1000) {
    errors.push('Timeout must be at least 1000ms')
  }

  return {
    valid: errors.length === 0,
    errors
  }
}

/**
 * Test all available providers
 */
export async function testAllProviders(): Promise<Array<{ provider: ProviderType; success: boolean; message: string; responseTime?: number }>> {
  const providers: ProviderType[] = ['openai', 'deepseek', 'qwen']
  const results = []

  for (const providerType of providers) {
    const startTime = Date.now()
    
    try {
      const apiKey = getApiKey(providerType)
      const config: ProviderConfig = {
        provider: providerType,
        apiKey,
        model: getDefaultModel(providerType)
      } as ProviderConfig

      const provider = createAIProvider(config)
      const result = await provider.testConnection()
      
      results.push({
        provider: providerType,
        success: result.success,
        message: result.message,
        responseTime: Date.now() - startTime
      })
    } catch (error) {
      results.push({
        provider: providerType,
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error',
        responseTime: Date.now() - startTime
      })
    }
  }

  return results
}

/**
 * Get the best available provider based on configuration and availability
 */
export async function getBestProvider(): Promise<AiClient> {
  const preferredOrder: ProviderType[] = [
    (process.env.AI_PROVIDER as ProviderType) || 'openai',
    'openai',
    'deepseek',
    'qwen'
  ]

  // Remove duplicates while preserving order
  const providers = [...new Set(preferredOrder)]

  for (const providerType of providers) {
    try {
      const apiKey = getApiKey(providerType)
      const config: ProviderConfig = {
        provider: providerType,
        apiKey,
        model: getDefaultModel(providerType)
      } as ProviderConfig

      const provider = createAIProvider(config)
      const connectionTest = await provider.testConnection()
      
      if (connectionTest.success) {
        console.log(`Using AI provider: ${providerType}`)
        return provider
      }
    } catch (error) {
      console.warn(`Provider ${providerType} unavailable:`, error instanceof Error ? error.message : 'Unknown error')
      continue
    }
  }

  throw new Error('No AI providers are available. Please check your API keys and configuration.')
}

/**
 * Provider comparison utilities
 */
export function compareProviders() {
  return {
    openai: {
      pros: ['High quality responses', 'Good JSON support', 'Built-in moderation'],
      cons: ['More expensive', 'Rate limits'],
      bestFor: ['Production use', 'High accuracy requirements']
    },
    deepseek: {
      pros: ['Cost effective', 'Good performance', 'Fast responses'],
      cons: ['No built-in moderation', 'Less established'],
      bestFor: ['Cost-sensitive applications', 'High volume usage']
    },
    qwen: {
      pros: ['Good for Chinese content', 'Local deployment option', 'Reasonable cost'],
      cons: ['May need VPN outside China', 'Response format variations'],
      bestFor: ['Chinese language content', 'Compliance requirements']
    }
  }
}

/**
 * Cost estimation utilities
 */
export async function estimateProviderCosts(inputLength: number): Promise<Record<ProviderType, number>> {
  const costs: Partial<Record<ProviderType, number>> = {}
  
  for (const providerType of ['openai', 'deepseek', 'qwen'] as ProviderType[]) {
    try {
      const apiKey = getApiKey(providerType)
      const config: ProviderConfig = {
        provider: providerType,
        apiKey,
        model: getDefaultModel(providerType)
      } as ProviderConfig

      const provider = createAIProvider(config)
      costs[providerType] = await provider.estimateCost(inputLength)
    } catch (error) {
      // Provider not available, skip
      continue
    }
  }

  return costs as Record<ProviderType, number>
}

// Re-export types and utilities
export type { AiClient, AiGenerationResult, ProviderConfig } from './providers/types'
export { validateAIResponse, createErrorResponse, createSuccessResponse } from './schema'
export type { AnswerSchemaType } from './schema'