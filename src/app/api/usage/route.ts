/**
 * /api/usage - Get user usage statistics
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/db/supabase-server'
import { getCurrentUser } from '@/lib/auth/auth'

export const runtime = 'edge'

/**
 * GET /api/usage - Get current usage stats for the user
 */
export async function GET(req: NextRequest) {
  try {
    // Get current user
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const supabase = await createClient()
    
    // Get user profile to check plan
    const { data: profile } = await supabase
      .from('profiles')
      .select('plan')
      .eq('id', user.id)
      .single()

    const plan = profile?.plan || 'free'
    const maxRequests = plan === 'free' 
      ? parseInt(process.env.MAX_FREE_REQUESTS_PER_DAY || '5', 10)
      : 1000 // Pro users get much higher limit

    // Get today's usage
    const today = new Date().toISOString().split('T')[0] // YYYY-MM-DD
    
    const { data: usage } = await supabase
      .from('usage_daily')
      .select('*')
      .eq('user_id', user.id)
      .eq('date', today)
      .single()

    const currentCount = usage?.count || 0
    // Note: Additional stats would need database schema updates
    const cacheHits = 0 // TODO: Add cache_hits to usage_daily table
    const tokensUsed = 0 // TODO: Add tokens_used to usage_daily table 
    const costCents = 0 // TODO: Add cost_cents to usage_daily table
    const errors = 0 // TODO: Add errors to usage_daily table

    // Get total usage this month
    const thisMonth = new Date().toISOString().substring(0, 7) // YYYY-MM
    
    const { data: monthlyStats, error: monthlyError } = await supabase
      .from('usage_daily')
      .select('count')
      .eq('user_id', user.id)
      .gte('date', `${thisMonth}-01`)
      .lte('date', `${thisMonth}-31`)

    let monthlyTotals = {
      requests: 0,
      tokens: 0,
      costCents: 0
    }

    if (!monthlyError && monthlyStats) {
      monthlyTotals = monthlyStats.reduce((acc, day) => ({
        requests: acc.requests + (day.count || 0),
        tokens: 0, // TODO: Add tokens_used field to schema
        costCents: 0 // TODO: Add cost_cents field to schema
      }), monthlyTotals)
    }

    return NextResponse.json({
      plan,
      today: {
        used: currentCount,
        remaining: Math.max(0, maxRequests - currentCount),
        limit: maxRequests,
        cacheHits,
        tokensUsed,
        costCents,
        errors,
        date: today
      },
      month: {
        requests: monthlyTotals.requests,
        tokens: monthlyTotals.tokens,
        costCents: monthlyTotals.costCents,
        period: thisMonth
      },
      canMakeRequest: currentCount < maxRequests,
      upgradeRequired: plan === 'free' && currentCount >= maxRequests
    })

  } catch (error) {
    console.error('Usage API error:', error)
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
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
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  })
}