// This file configures the initialization of Sentry on the server side.
// The config you add here will be used whenever the server handles a request.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from '@sentry/nextjs'

if (process.env.SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    
    // Adjust this value in production, or use tracesSampler for greater control
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
    
    // ...
    // Note: if you want to override the automatic release value, do not set a
    // `release` value here - use the environment variable `SENTRY_RELEASE`, so
    // that it will also get attached to your source maps
    
    environment: process.env.NODE_ENV,
    
    beforeSend(event, hint) {
      // Don't send events in development unless explicitly enabled
      if (process.env.NODE_ENV === 'development' && !process.env.SENTRY_DEBUG) {
        return null
      }

      // Filter out known non-critical errors
      const error = hint.originalException
      if (error instanceof Error) {
        // Skip database connection timeouts in development
        if (process.env.NODE_ENV === 'development' && 
            error.message?.includes('timeout')) {
          return null
        }
        
        // Skip expected validation errors
        if (error.message?.includes('ValidationError') ||
            error.message?.includes('ZodError')) {
          return null
        }
      }

      return event
    },

    integrations: [
      // Basic server integrations only
    ],
    
    // Note: Some options require specific Sentry versions
  })
}