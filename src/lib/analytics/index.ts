/**
 * Unified analytics client for QuizMate
 * Combines PostHog analytics and Sentry error monitoring
 */

import { 
  track as posthogTrack, 
  identify as posthogIdentify,
  setUserProperties,
  reset as posthogReset,
  trackPageView,
  trackPerformance,
  isFeatureEnabled,
  flush as posthogFlush,
  initClientPostHog,
  type AnalyticsEvent
} from './posthog'

import {
  captureError,
  captureAPIError,
  captureUIError,
  setUser as sentrySetUser,
  clearUser as sentryClearUser,
  addBreadcrumb,
  measureAsync,
  measureSync,
  flush as sentryFlush,
  initSentry
} from './sentry'

// Initialize analytics (call this in app initialization)
export function initAnalytics(): void {
  try {
    // Initialize PostHog for client-side analytics
    if (typeof window !== 'undefined') {
      initClientPostHog()
    }
    
    // Initialize Sentry for error monitoring
    initSentry()
  } catch (error) {
    console.error('Failed to initialize analytics:', error)
  }
}

// User management
export interface UserAnalyticsData {
  id: string
  email?: string
  plan?: 'free' | 'pro'
  locale?: string
  createdAt?: string
}

export function identifyUser(userData: UserAnalyticsData): void {
  try {
    // PostHog identification
    posthogIdentify(userData.id, {
      email: userData.email,
      plan: userData.plan,
      locale: userData.locale,
      created_at: userData.createdAt
    })

    // Sentry user context
    sentrySetUser(userData.id, userData.email, userData.plan)

    // Add breadcrumb
    addBreadcrumb(
      `User identified: ${userData.id}`,
      'user',
      'info',
      { plan: userData.plan, locale: userData.locale }
    )
  } catch (error) {
    console.error('Failed to identify user:', error)
  }
}

export function updateUserProperties(properties: Record<string, any>): void {
  try {
    setUserProperties(properties)
    addBreadcrumb(
      'User properties updated',
      'user',
      'info',
      properties
    )
  } catch (error) {
    console.error('Failed to update user properties:', error)
  }
}

export function clearUser(): void {
  try {
    posthogReset()
    sentryClearUser()
    addBreadcrumb('User logged out', 'user', 'info')
  } catch (error) {
    console.error('Failed to clear user:', error)
  }
}

// Analytics tracking with error handling
export function track<T extends keyof AnalyticsEvent>(
  eventName: T,
  properties: AnalyticsEvent[T],
  userId?: string
): void {
  try {
    posthogTrack(eventName, properties, userId)
    
    // Add breadcrumb for important events
    const importantEvents = [
      'generate_start', 'generate_finish', 'subscribe_success', 
      'limit_hit', 'user_registered', 'api_error'
    ]
    
    if (importantEvents.includes(eventName)) {
      addBreadcrumb(
        `Event: ${eventName}`,
        'analytics',
        'info',
        properties as Record<string, any>
      )
    }
  } catch (error) {
    console.error('Failed to track event:', error)
    captureError(error, {
      component: 'analytics',
      action: 'track_event',
      metadata: { eventName, properties }
    })
  }
}

// Specific tracking methods for common events
export const Analytics = {
  // Page tracking
  pageView: (path: string, locale: string) => {
    trackPageView(path, locale)
  },

  // User events
  userRegistered: (method: 'email' | 'google', source?: string) => {
    track('user_registered', { method, source })
  },

  userLogin: (method: 'email' | 'google') => {
    track('user_login', { method })
  },

  userLogout: () => {
    track('user_logout', {})
    clearUser()
  },

  // Quiz generation events
  generateStart: (params: {
    input_length: number
    language: string
    subject?: string
    grade?: string
    has_file?: boolean
    file_type?: string
  }) => {
    track('generate_start', params)
  },

  generateFinish: (params: {
    success: boolean
    from_cache: boolean
    response_time_ms: number
    tokens_used?: number
    cost_cents?: number
    ai_provider?: string
    confidence?: number
    question_type?: string
    error?: string
  }) => {
    track('generate_finish', params)
  },

  cacheHit: (hash: string, response_time_ms: number) => {
    track('from_cache', { hash, response_time_ms })
  },

  limitHit: (plan: 'free' | 'pro', usage_count: number, limit: number) => {
    track('limit_hit', { plan, usage_count, limit })
  },

  // Billing events
  subscribeClick: (plan: 'pro', source: string) => {
    track('subscribe_click', { 
      plan, 
      source: source as 'usage_badge' | 'settings' | 'limit_modal' | 'pricing_page'
    })
  },

  subscribeSuccess: (plan: 'pro', amount_cents: number, customer_id: string) => {
    track('subscribe_success', { plan, amount_cents, customer_id })
  },

  subscribeCancel: (plan: 'pro', reason?: string) => {
    track('subscribe_cancel', { plan, reason })
  },

  // UI events
  flashcardSave: (question_id: string, flashcard_count: number) => {
    track('flashcard_save', { question_id, flashcard_count })
  },

  flashcardReview: (card_id: string, difficulty: number, result: 'correct' | 'incorrect' | 'skipped') => {
    track('flashcard_review', { card_id, difficulty, result })
  },

  languageChange: (from: string, to: string) => {
    track('language_change', { from, to })
  },

  // Performance tracking
  performance: (operation: string, duration: number, metadata?: Record<string, any>) => {
    trackPerformance(operation, duration, metadata)
  }
}

// Error tracking
export const ErrorTracking = {
  // API errors
  apiError: (error: Error | string, endpoint: string, userId?: string, metadata?: Record<string, any>) => {
    captureAPIError(error, endpoint, userId, metadata)
    track('api_error', {
      endpoint,
      error_code: error instanceof Error ? error.name : 'Unknown',
      error_message: error instanceof Error ? error.message : error,
      user_id: userId
    })
  },

  // UI errors
  uiError: (error: Error | string, component: string, userId?: string, metadata?: Record<string, any>) => {
    captureUIError(error, component, userId, metadata)
    track('ui_error', {
      component,
      error_message: error instanceof Error ? error.message : error,
      error_stack: error instanceof Error ? error.stack : undefined
    })
  },

  // Generic error
  error: (error: Error | string, context?: {
    userId?: string
    component?: string
    action?: string
    metadata?: Record<string, any>
  }) => {
    captureError(error, context)
  }
}

// Performance measurement utilities
export const Performance = {
  measureAsync: async <T>(
    name: string,
    operation: string,
    fn: () => Promise<T>
  ): Promise<T> => {
    const startTime = Date.now()
    try {
      const result = await measureAsync(name, operation, fn)
      const duration = Date.now() - startTime
      Analytics.performance(operation, duration, { name, success: true })
      return result
    } catch (error) {
      const duration = Date.now() - startTime
      Analytics.performance(operation, duration, { name, success: false, error: String(error) })
      throw error
    }
  },

  measureSync: <T>(
    name: string,
    operation: string,
    fn: () => T
  ): T => {
    const startTime = Date.now()
    try {
      const result = measureSync(name, operation, fn)
      const duration = Date.now() - startTime
      Analytics.performance(operation, duration, { name, success: true })
      return result
    } catch (error) {
      const duration = Date.now() - startTime
      Analytics.performance(operation, duration, { name, success: false, error: String(error) })
      throw error
    }
  }
}

// Feature flags
export function useFeatureFlag(flagKey: string): boolean {
  return isFeatureEnabled(flagKey)
}

// Flush all analytics (useful for serverless environments)
export async function flushAnalytics(): Promise<void> {
  try {
    await Promise.all([
      posthogFlush(),
      sentryFlush()
    ])
  } catch (error) {
    console.error('Failed to flush analytics:', error)
  }
}

// Export main interfaces
export type { AnalyticsEvent, UserAnalyticsData }

// Default export with all utilities
export default {
  init: initAnalytics,
  track,
  identify: identifyUser,
  updateUser: updateUserProperties,
  clearUser,
  Analytics,
  ErrorTracking,
  Performance,
  useFeatureFlag,
  flush: flushAnalytics
}