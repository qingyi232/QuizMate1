// This file configures the initialization of Sentry for edge runtime.
// The config you add here will be used whenever the edge runtime handles a request.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from '@sentry/nextjs'

if (process.env.SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    
    // Adjust this value in production, or use tracesSampler for greater control
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
    
    environment: process.env.NODE_ENV,
    
    beforeSend(event, hint) {
      // Don't send events in development unless explicitly enabled
      if (process.env.NODE_ENV === 'development' && !process.env.SENTRY_DEBUG) {
        return null
      }

      // Filter out known non-critical errors
      const error = hint.originalException
      if (error instanceof Error) {
        // Skip expected API validation errors
        if (error.message?.includes('ValidationError') ||
            error.message?.includes('ZodError')) {
          return null
        }
        
        // Skip rate limiting errors
        if (error.message?.includes('Rate limit') ||
            error.message?.includes('Too many requests')) {
          return null
        }
      }

      return event
    },
    
    // Edge runtime specific configuration
    integrations: [
      // Note: Some integrations are not available in edge runtime
      // Only use integrations that are compatible with edge environment
    ],
    
    // Performance monitoring for edge functions
    profilesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  })
}