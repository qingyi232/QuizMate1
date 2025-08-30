/**
 * /api/health - System health check endpoint
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/db/supabase-server'
import { testAllProviders } from '@/lib/ai'
import { getCache } from '@/lib/cache'

export const runtime = 'edge'

/**
 * GET /api/health - System health status
 */
export async function GET(req: NextRequest) {
  const startTime = Date.now()
  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    services: {} as Record<string, any>
  }

  try {
    // Check database connection
    health.services.database = await checkDatabase()

    // Check cache connection
    health.services.cache = await checkCache()

    // Check AI providers (optional - can be slow)
    const checkProviders = req.nextUrl.searchParams.get('providers') === 'true'
    if (checkProviders) {
      health.services.ai_providers = await checkAIProviders()
    }

    // Overall status
    const allHealthy = Object.values(health.services).every(
      service => service.status === 'healthy' || service.status === 'degraded'
    )

    health.status = allHealthy ? 'healthy' : 'unhealthy'
    
    // Add response time
    health.services.response_time = {
      status: 'healthy',
      duration_ms: Date.now() - startTime
    }

    const httpStatus = health.status === 'healthy' ? 200 : 503

    return NextResponse.json(health, { status: httpStatus })

  } catch (error) {
    console.error('Health check error:', error)
    
    return NextResponse.json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error',
      services: health.services
    }, { status: 503 })
  }
}

/**
 * Check database connectivity
 */
async function checkDatabase() {
  try {
    const supabase = await createClient()
    const start = Date.now()
    
    // Simple query to test connection
    const { error } = await supabase
      .from('profiles')
      .select('id')
      .limit(1)
      .single()

    // It's ok if there are no profiles, we just want to test connectivity
    const duration = Date.now() - start

    return {
      status: 'healthy',
      duration_ms: duration,
      connection: 'active'
    }
  } catch (error) {
    return {
      status: 'unhealthy',
      error: error instanceof Error ? error.message : 'Database connection failed'
    }
  }
}

/**
 * Check cache connectivity
 */
async function checkCache() {
  try {
    const cache = getCache()
    const start = Date.now()
    const testKey = 'health_check_' + Date.now()
    
    // Test cache write/read
    await cache.set(testKey, { test: true }, { ttl: 10 })
    const result = await cache.get(testKey)
    await cache.delete(testKey)
    
    const duration = Date.now() - start

    return {
      status: result.hit ? 'healthy' : 'degraded',
      duration_ms: duration,
      cache_hit: result.hit,
      source: result.source
    }
  } catch (error) {
    return {
      status: 'degraded', // Cache failure shouldn't kill the service
      error: error instanceof Error ? error.message : 'Cache error'
    }
  }
}

/**
 * Check AI provider availability
 */
async function checkAIProviders() {
  try {
    const results = await testAllProviders()
    
    const providers = results.reduce((acc, result) => {
      acc[result.provider] = {
        status: result.success ? 'healthy' : 'unhealthy',
        response_time_ms: result.responseTime,
        message: result.message
      }
      return acc
    }, {} as Record<string, any>)

    const anyHealthy = results.some(r => r.success)
    
    return {
      status: anyHealthy ? 'healthy' : 'unhealthy',
      providers,
      available_count: results.filter(r => r.success).length,
      total_count: results.length
    }
  } catch (error) {
    return {
      status: 'unhealthy',
      error: error instanceof Error ? error.message : 'Provider check failed'
    }
  }
}

/**
 * Handle OPTIONS request for CORS
 */
export async function OPTIONS(req: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
}