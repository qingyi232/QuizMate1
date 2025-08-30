// This file configures the initialization of Sentry on the browser/client side.
// The config you add here will be used whenever a page is visited.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from '@sentry/nextjs'

if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
    
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
        // Skip network errors
        if (error.message?.includes('NetworkError') || 
            error.message?.includes('fetch')) {
          return null
        }
        
        // Skip ResizeObserver errors
        if (error.message?.includes('ResizeObserver')) {
          return null
        }

        // Skip cancelled requests
        if (error.message?.includes('AbortError') ||
            error.message?.includes('Request was cancelled')) {
          return null
        }
      }

      return event
    },

    integrations: [
      // Basic integrations only - advanced features require specific Sentry versions
    ],
    
    // Session Replay
    replaysSessionSampleRate: 0.1, // 10% of sessions will have replays
    replaysOnErrorSampleRate: 1.0, // 100% of sessions with errors will have replays
  })
}