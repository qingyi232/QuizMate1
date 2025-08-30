/**
 * Caching layer with Redis (primary) and Supabase (fallback) support
 */

import { AnswerSchemaType } from '../ai/schema'
import { createClient } from '../db/supabase-server'

// Types
export interface CacheOptions {
  ttl?: number // Time to live in seconds
  tags?: string[] // Cache tags for invalidation
  namespace?: string // Cache namespace
}

export interface CacheResult<T = any> {
  hit: boolean
  data?: T
  key: string
  source?: 'redis' | 'supabase' | 'memory'
  createdAt?: Date
  expiresAt?: Date
}

export interface CacheStats {
  hits: number
  misses: number
  hitRate: number
  totalRequests: number
  avgResponseTime: number
}

/**
 * Cache interface
 */
export interface CacheClient {
  get<T = any>(key: string): Promise<CacheResult<T>>
  set(key: string, value: any, options?: CacheOptions): Promise<boolean>
  delete(key: string): Promise<boolean>
  clear(pattern?: string): Promise<number>
  exists(key: string): Promise<boolean>
  getStats(): Promise<CacheStats>
}

/**
 * Redis cache implementation (when available)
 */
class RedisCache implements CacheClient {
  private redis: any
  private connected: boolean = false

  constructor() {
    this.initRedis()
  }

  private async initRedis() {
    try {
      const { Redis } = await import('@upstash/redis')
      
      if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
        console.warn('Redis credentials not found, falling back to Supabase cache')
        return
      }

      this.redis = new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL,
        token: process.env.UPSTASH_REDIS_REST_TOKEN,
      })

      // Test connection
      await this.redis.ping()
      this.connected = true
      console.log('Redis cache connected successfully')
    } catch (error) {
      console.warn('Redis connection failed:', error)
      this.connected = false
    }
  }

  async get<T = any>(key: string): Promise<CacheResult<T>> {
    if (!this.connected) {
      return { hit: false, key }
    }

    try {
      const data = await this.redis.get(key)
      
      if (data === null) {
        return { hit: false, key }
      }

      return {
        hit: true,
        data: JSON.parse(data),
        key,
        source: 'redis'
      }
    } catch (error) {
      console.error('Redis get error:', error)
      return { hit: false, key }
    }
  }

  async set(key: string, value: any, options: CacheOptions = {}): Promise<boolean> {
    if (!this.connected) {
      return false
    }

    try {
      const serialized = JSON.stringify(value)
      
      if (options.ttl) {
        await this.redis.setex(key, options.ttl, serialized)
      } else {
        await this.redis.set(key, serialized)
      }

      return true
    } catch (error) {
      console.error('Redis set error:', error)
      return false
    }
  }

  async delete(key: string): Promise<boolean> {
    if (!this.connected) {
      return false
    }

    try {
      const result = await this.redis.del(key)
      return result > 0
    } catch (error) {
      console.error('Redis delete error:', error)
      return false
    }
  }

  async clear(pattern?: string): Promise<number> {
    if (!this.connected) {
      return 0
    }

    try {
      if (pattern) {
        const keys = await this.redis.keys(pattern)
        if (keys.length > 0) {
          return await this.redis.del(...keys)
        }
        return 0
      } else {
        await this.redis.flushall()
        return 1 // Approximate
      }
    } catch (error) {
      console.error('Redis clear error:', error)
      return 0
    }
  }

  async exists(key: string): Promise<boolean> {
    if (!this.connected) {
      return false
    }

    try {
      const result = await this.redis.exists(key)
      return result === 1
    } catch (error) {
      console.error('Redis exists error:', error)
      return false
    }
  }

  async getStats(): Promise<CacheStats> {
    if (!this.connected) {
      return { hits: 0, misses: 0, hitRate: 0, totalRequests: 0, avgResponseTime: 0 }
    }

    try {
      const info = await this.redis.info('stats')
      // Parse Redis stats if needed
      return { hits: 0, misses: 0, hitRate: 0, totalRequests: 0, avgResponseTime: 0 }
    } catch (error) {
      return { hits: 0, misses: 0, hitRate: 0, totalRequests: 0, avgResponseTime: 0 }
    }
  }
}

/**
 * Supabase cache implementation (fallback)
 */
class SupabaseCache implements CacheClient {
  async get<T = any>(key: string): Promise<CacheResult<T>> {
    try {
      const supabase = await createClient()
      
      const { data, error } = await supabase
        .from('answer_cache')
        .select('*')
        .eq('hash', key)
        .single()

      if (error || !data) {
        return { hit: false, key }
      }

      // Check if expired
      if (data.expires_at && new Date(data.expires_at) < new Date()) {
        // Delete expired entry
        await this.delete(key)
        return { hit: false, key }
      }

      return {
        hit: true,
        data: data.answer,
        key,
        source: 'supabase',
        createdAt: new Date(data.created_at),
        expiresAt: data.expires_at ? new Date(data.expires_at) : undefined
      }
    } catch (error) {
      console.error('Supabase cache get error:', error)
      return { hit: false, key }
    }
  }

  async set(key: string, value: any, options: CacheOptions = {}): Promise<boolean> {
    try {
      const supabase = await createClient()
      
      const expiresAt = options.ttl 
        ? new Date(Date.now() + options.ttl * 1000).toISOString()
        : null

      const { error } = await supabase
        .from('answer_cache')
        .upsert({
          hash: key,
          normalized_prompt: key, // Use key as normalized prompt for now
          answer: value,
          created_at: new Date().toISOString(),
          expires_at: expiresAt
        })

      if (error) {
        console.error('Supabase cache set error:', error)
        return false
      }

      return true
    } catch (error) {
      console.error('Supabase cache set error:', error)
      return false
    }
  }

  async delete(key: string): Promise<boolean> {
    try {
      const supabase = await createClient()
      
      const { error } = await supabase
        .from('answer_cache')
        .delete()
        .eq('hash', key)

      return !error
    } catch (error) {
      console.error('Supabase cache delete error:', error)
      return false
    }
  }

  async clear(pattern?: string): Promise<number> {
    try {
      const supabase = await createClient()
      
      let query = supabase.from('answer_cache').delete()
      
      if (pattern) {
        // Simple pattern matching with LIKE
        const likePattern = pattern.replace('*', '%')
        query = query.like('hash', likePattern)
      } else {
        // Clear all - this is dangerous, so we'll limit it
        query = query.neq('hash', 'never_match_this')
      }

      const { error, count } = await query

      if (error) {
        console.error('Supabase cache clear error:', error)
        return 0
      }

      return count || 0
    } catch (error) {
      console.error('Supabase cache clear error:', error)
      return 0
    }
  }

  async exists(key: string): Promise<boolean> {
    try {
      const supabase = await createClient()
      
      const { data, error } = await supabase
        .from('answer_cache')
        .select('hash')
        .eq('hash', key)
        .single()

      return !error && !!data
    } catch (error) {
      return false
    }
  }

  async getStats(): Promise<CacheStats> {
    try {
      const supabase = await createClient()
      
      const { count } = await supabase
        .from('answer_cache')
        .select('*', { count: 'exact', head: true })

      return {
        hits: 0, // Would need to track this separately
        misses: 0,
        hitRate: 0,
        totalRequests: count || 0,
        avgResponseTime: 0
      }
    } catch (error) {
      return { hits: 0, misses: 0, hitRate: 0, totalRequests: 0, avgResponseTime: 0 }
    }
  }
}

/**
 * Memory cache implementation (last resort)
 */
class MemoryCache implements CacheClient {
  private cache = new Map<string, { value: any; expiresAt?: number }>()
  private stats = { hits: 0, misses: 0, sets: 0 }

  async get<T = any>(key: string): Promise<CacheResult<T>> {
    const entry = this.cache.get(key)
    
    if (!entry) {
      this.stats.misses++
      return { hit: false, key }
    }

    // Check expiration
    if (entry.expiresAt && entry.expiresAt < Date.now()) {
      this.cache.delete(key)
      this.stats.misses++
      return { hit: false, key }
    }

    this.stats.hits++
    return {
      hit: true,
      data: entry.value,
      key,
      source: 'memory'
    }
  }

  async set(key: string, value: any, options: CacheOptions = {}): Promise<boolean> {
    const expiresAt = options.ttl ? Date.now() + (options.ttl * 1000) : undefined
    
    this.cache.set(key, { value, expiresAt })
    this.stats.sets++
    
    return true
  }

  async delete(key: string): Promise<boolean> {
    return this.cache.delete(key)
  }

  async clear(pattern?: string): Promise<number> {
    if (!pattern) {
      const count = this.cache.size
      this.cache.clear()
      return count
    }

    // Simple pattern matching
    const regex = new RegExp(pattern.replace('*', '.*'))
    let deleted = 0
    
    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.cache.delete(key)
        deleted++
      }
    }
    
    return deleted
  }

  async exists(key: string): Promise<boolean> {
    return this.cache.has(key)
  }

  async getStats(): Promise<CacheStats> {
    const total = this.stats.hits + this.stats.misses
    return {
      hits: this.stats.hits,
      misses: this.stats.misses,
      hitRate: total > 0 ? this.stats.hits / total : 0,
      totalRequests: total,
      avgResponseTime: 0 // Memory is instant
    }
  }
}

/**
 * Multi-layer cache with fallback strategy
 */
class MultiLayerCache implements CacheClient {
  private primary: CacheClient
  private fallback: CacheClient
  private memory: CacheClient

  constructor() {
    this.primary = new RedisCache()
    this.fallback = new SupabaseCache()
    this.memory = new MemoryCache()
  }

  async get<T = any>(key: string): Promise<CacheResult<T>> {
    // Try memory first (fastest)
    let result = await this.memory.get<T>(key)
    if (result.hit) {
      return result
    }

    // Try Redis second
    result = await this.primary.get<T>(key)
    if (result.hit) {
      // Populate memory cache
      await this.memory.set(key, result.data, { ttl: 300 }) // 5 minutes in memory
      return result
    }

    // Try Supabase last
    result = await this.fallback.get<T>(key)
    if (result.hit) {
      // Populate upper caches
      await this.memory.set(key, result.data, { ttl: 300 })
      await this.primary.set(key, result.data, { ttl: 3600 }) // 1 hour in Redis
      return result
    }

    return result
  }

  async set(key: string, value: any, options: CacheOptions = {}): Promise<boolean> {
    const results = await Promise.allSettled([
      this.memory.set(key, value, { ttl: 300 }),
      this.primary.set(key, value, options),
      this.fallback.set(key, value, options)
    ])

    // Return true if at least one succeeded
    return results.some(result => result.status === 'fulfilled' && result.value)
  }

  async delete(key: string): Promise<boolean> {
    const results = await Promise.allSettled([
      this.memory.delete(key),
      this.primary.delete(key),
      this.fallback.delete(key)
    ])

    // Return true if at least one succeeded
    return results.some(result => result.status === 'fulfilled' && result.value)
  }

  async clear(pattern?: string): Promise<number> {
    const results = await Promise.allSettled([
      this.memory.clear(pattern),
      this.primary.clear(pattern),
      this.fallback.clear(pattern)
    ])

    // Return the highest count
    return Math.max(...results
      .filter(result => result.status === 'fulfilled')
      .map(result => (result as PromiseFulfilledResult<number>).value)
    )
  }

  async exists(key: string): Promise<boolean> {
    // Check in order of speed
    const checks = [
      await this.memory.exists(key),
      await this.primary.exists(key),
      await this.fallback.exists(key)
    ]

    return checks.some(Boolean)
  }

  async getStats(): Promise<CacheStats> {
    const [memoryStats, primaryStats, fallbackStats] = await Promise.all([
      this.memory.getStats(),
      this.primary.getStats(),
      this.fallback.getStats()
    ])

    return {
      hits: memoryStats.hits + primaryStats.hits + fallbackStats.hits,
      misses: memoryStats.misses + primaryStats.misses + fallbackStats.misses,
      hitRate: 0, // Will be calculated
      totalRequests: memoryStats.totalRequests + primaryStats.totalRequests + fallbackStats.totalRequests,
      avgResponseTime: (memoryStats.avgResponseTime + primaryStats.avgResponseTime + fallbackStats.avgResponseTime) / 3
    }
  }
}

// Singleton cache instance
let cacheInstance: CacheClient | null = null

/**
 * Get the cache instance (singleton)
 */
export function getCache(): CacheClient {
  if (!cacheInstance) {
    cacheInstance = new MultiLayerCache()
  }
  return cacheInstance
}

/**
 * Answer-specific cache utilities
 */
export class AnswerCache {
  private cache: CacheClient

  constructor(cache?: CacheClient) {
    this.cache = cache || getCache()
  }

  async get(hash: string): Promise<AnswerSchemaType | null> {
    const result = await this.cache.get<AnswerSchemaType>(hash)
    return result.hit ? result.data : null
  }

  async set(hash: string, answer: AnswerSchemaType, ttl: number = 86400): Promise<boolean> {
    return this.cache.set(hash, answer, { ttl, tags: ['answer'] })
  }

  async delete(hash: string): Promise<boolean> {
    return this.cache.delete(hash)
  }

  async exists(hash: string): Promise<boolean> {
    return this.cache.exists(hash)
  }

  async clear(): Promise<number> {
    return this.cache.clear('answer:*')
  }

  async getStats(): Promise<CacheStats> {
    return this.cache.getStats()
  }
}

// Export default cache instances
export const answerCache = new AnswerCache()
export default getCache()