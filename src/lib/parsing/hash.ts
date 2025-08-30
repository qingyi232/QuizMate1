/**
 * Hashing utilities for caching and deduplication
 */

import { normalize } from './normalize'

/**
 * Generate a hash for prompt caching
 */
export async function hashPrompt(text: string, metadata?: Record<string, any>): Promise<string> {
  // Normalize the text for consistent hashing
  const normalizedText = normalize(text)
  
  // Create a consistent string that includes metadata
  const metaString = metadata ? JSON.stringify(sortObject(metadata)) : ''
  const combinedString = `${normalizedText}|||${metaString}`
  
  // Generate SHA-256 hash
  const encoder = new TextEncoder()
  const data = encoder.encode(combinedString)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  
  // Convert to hex string
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
  
  return hashHex
}

/**
 * Generate a shorter hash for UI display
 */
export async function hashShort(text: string): Promise<string> {
  const fullHash = await hashPrompt(text)
  return fullHash.substring(0, 12) // First 12 characters
}

/**
 * Generate a hash for question deduplication
 */
export async function hashQuestion(questionText: string, options?: string[]): Promise<string> {
  const normalizedQuestion = normalize(questionText)
  const normalizedOptions = options ? options.map(opt => normalize(opt)).sort() : []
  
  const combined = [normalizedQuestion, ...normalizedOptions].join('|||')
  return hashPrompt(combined)
}

/**
 * Generate a content-based hash (ignores formatting)
 */
export async function hashContent(text: string): Promise<string> {
  // More aggressive normalization for content hashing
  const normalized = normalize(text)
    .toLowerCase()
    .replace(/[^\w\s]/g, '') // Remove all punctuation
    .replace(/\s+/g, ' ')    // Normalize spaces
    .trim()
  
  return hashPrompt(normalized)
}

/**
 * Check if two texts would produce the same hash
 */
export async function isContentDuplicate(text1: string, text2: string): Promise<boolean> {
  const hash1 = await hashContent(text1)
  const hash2 = await hashContent(text2)
  return hash1 === hash2
}

/**
 * Generate a deterministic cache key
 */
export function createCacheKey(prefix: string, ...parts: (string | number | boolean)[]): string {
  const cleanParts = parts
    .map(part => String(part))
    .map(part => part.replace(/[^a-zA-Z0-9]/g, '_'))
    .filter(part => part.length > 0)
  
  return `${prefix}:${cleanParts.join(':')}`
}

/**
 * Generate cache key for answers
 */
export async function createAnswerCacheKey(
  questionText: string,
  options?: string[],
  metadata?: {
    subject?: string
    grade?: string
    language?: string
    targetLanguage?: string
  }
): Promise<string> {
  const hash = await hashQuestion(questionText, options)
  const metaParts = [
    metadata?.subject || 'general',
    metadata?.grade || 'unknown',
    metadata?.language || 'auto',
    metadata?.targetLanguage || 'en'
  ]
  
  return createCacheKey('answer', hash, ...metaParts)
}

/**
 * Sort object keys for consistent stringification
 */
function sortObject(obj: Record<string, any>): Record<string, any> {
  const sorted: Record<string, any> = {}
  const keys = Object.keys(obj).sort()
  
  for (const key of keys) {
    const value = obj[key]
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      sorted[key] = sortObject(value)
    } else if (Array.isArray(value)) {
      sorted[key] = value.map(item => 
        typeof item === 'object' && item !== null ? sortObject(item) : item
      )
    } else {
      sorted[key] = value
    }
  }
  
  return sorted
}

/**
 * Generate a fingerprint for rate limiting
 */
export async function createUserFingerprint(
  userId: string,
  ipAddress?: string,
  userAgent?: string
): Promise<string> {
  const components = [
    userId,
    ipAddress || 'unknown_ip',
    userAgent ? userAgent.substring(0, 100) : 'unknown_ua'
  ]
  
  return hashPrompt(components.join('|||'))
}

/**
 * Generate a session-based cache key
 */
export function createSessionKey(sessionId: string, suffix: string): string {
  return createCacheKey('session', sessionId, suffix)
}

/**
 * Validate hash format
 */
export function isValidHash(hash: string): boolean {
  // SHA-256 hash should be 64 hex characters
  return /^[a-f0-9]{64}$/i.test(hash)
}

/**
 * Extract hash components for debugging
 */
export interface HashInfo {
  algorithm: string
  length: number
  isValid: boolean
  shortHash: string
}

export function getHashInfo(hash: string): HashInfo {
  return {
    algorithm: 'SHA-256',
    length: hash.length,
    isValid: isValidHash(hash),
    shortHash: hash.substring(0, 8)
  }
}

/**
 * Generate a hash for file content
 */
export async function hashFile(content: string, filename?: string): Promise<string> {
  const metadata = filename ? { filename } : undefined
  return hashPrompt(content, metadata)
}

/**
 * Compare hash performance for different inputs
 */
export async function benchmarkHash(texts: string[]): Promise<{
  averageTime: number
  totalHashes: number
  uniqueHashes: number
}> {
  const start = performance.now()
  const hashes = new Set<string>()
  
  for (const text of texts) {
    const hash = await hashPrompt(text)
    hashes.add(hash)
  }
  
  const end = performance.now()
  
  return {
    averageTime: (end - start) / texts.length,
    totalHashes: texts.length,
    uniqueHashes: hashes.size
  }
}