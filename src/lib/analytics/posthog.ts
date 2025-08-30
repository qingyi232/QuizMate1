/**
 * Simplified PostHog analytics client for QuizMate (Demo Mode)
 */

// Server-side PostHog client (simplified)
export function getServerPostHog() {
  return null
}

// Client-side PostHog initialization (simplified)
export function initClientPostHog() {
  console.log('PostHog initialized in demo mode')
}

// Track events
export function trackEvent(
  event: string,
  properties?: Record<string, any>,
  userId?: string
) {
  console.log('PostHog Event:', { event, properties, userId })
}

// Track page views
export function trackPageView(path: string, userId?: string) {
  console.log('PostHog Page View:', { path, userId })
}

// Identify user
export function identifyUser(
  userId: string,
  properties?: Record<string, any>
) {
  console.log('PostHog Identify User:', { userId, properties })
}

// Reset user
export function resetUser() {
  console.log('PostHog Reset User')
}

// Set user properties
export function setUserProperties(properties: Record<string, any>) {
  console.log('PostHog Set User Properties:', properties)
}

// Feature flags
export function getFeatureFlag(flag: string, userId?: string): boolean {
  console.log('PostHog Feature Flag:', { flag, userId })
  return false
}

export async function getAllFeatureFlags(userId?: string): Promise<Record<string, boolean>> {
  console.log('PostHog Get All Feature Flags:', { userId })
  return {}
}

// A/B testing
export function getABTestVariant(test: string, userId?: string): string {
  console.log('PostHog A/B Test:', { test, userId })
  return 'control'
}

// Flush analytics (for Edge Runtime compatibility)
export async function flush(): Promise<void> {
  console.log('PostHog flush (demo mode)')
}

// Alias for compatibility
export const flushAnalytics = flush

export default {
  getServerPostHog,
  initClientPostHog,
  trackEvent,
  trackPageView,
  identifyUser,
  resetUser,
  setUserProperties,
  getFeatureFlag,
  getAllFeatureFlags,
  getABTestVariant,
  flush,
  flushAnalytics
}