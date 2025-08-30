/**
 * Simplified Sentry error monitoring for QuizMate (Demo Mode)
 */

// Error types for structured logging
export interface ErrorContext {
  userId?: string
  endpoint?: string
  component?: string
  action?: string
  metadata?: Record<string, any>
}

// Initialize Sentry (simplified for demo)
export function initSentry() {
  console.log('Sentry initialized in demo mode')
}

// Capture exception with context
export function captureError(
  error: Error | string,
  context: ErrorContext = {}
): void {
  console.error('Sentry Error:', error, context)
}

// Capture API errors specifically
export function captureAPIError(
  error: Error | string,
  endpoint: string,
  userId?: string,
  metadata?: Record<string, any>
): void {
  console.error('API Error:', { error, endpoint, userId, metadata })
}

// Capture UI errors specifically
export function captureUIError(
  error: Error | string,
  component: string,
  userId?: string,
  metadata?: Record<string, any>
): void {
  console.error('UI Error:', { error, component, userId, metadata })
}

// Set user context for error tracking
export function setUser(userId: string, email?: string, plan?: string): void {
  console.log('Sentry User Set:', { userId, email, plan })
}

// Clear user context (on logout)
export function clearUser(): void {
  console.log('Sentry User Cleared')
}

// Add breadcrumb for debugging
export function addBreadcrumb(
  message: string,
  category: string,
  level: 'debug' | 'info' | 'warning' | 'error' = 'info',
  data?: Record<string, any>
): void {
  console.log('Sentry Breadcrumb:', { message, category, level, data })
}

// Performance monitoring
export function startTransaction(name: string, operation: string) {
  console.log('Sentry Transaction:', { name, operation })
  return null
}

// Measure performance of async operations
export async function measureAsync<T>(
  name: string,
  operation: string,
  fn: () => Promise<T>
): Promise<T> {
  console.log('Measuring async:', name, operation)
  return await fn()
}

// Measure performance of sync operations
export function measureSync<T>(
  name: string,
  operation: string,
  fn: () => T
): T {
  console.log('Measuring sync:', name, operation)
  return fn()
}

// Flush Sentry events
export async function flush(timeout = 2000): Promise<boolean> {
  console.log('Sentry flush (demo mode)')
  return true
}

export default {
  initSentry,
  captureError,
  captureAPIError,
  captureUIError,
  setUser,
  clearUser,
  addBreadcrumb,
  startTransaction,
  measureAsync,
  measureSync,
  flush
}