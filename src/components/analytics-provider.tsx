'use client'

import { createContext, useContext, useEffect, ReactNode } from 'react'
import { useUser } from '@supabase/auth-helpers-react'
import { useLocale } from 'next-intl'
import Analytics, { initAnalytics, identifyUser, clearUser } from '@/lib/analytics'

// Create analytics context
const AnalyticsContext = createContext(Analytics)

interface AnalyticsProviderProps {
  children: ReactNode
}

export function AnalyticsProvider({ children }: AnalyticsProviderProps) {
  const user = useUser()
  const locale = useLocale()

  // Initialize analytics on mount
  useEffect(() => {
    initAnalytics()
    
    // Track initial page view
    if (typeof window !== 'undefined') {
      Analytics.pageView(window.location.pathname, locale)
    }
  }, [locale])

  // Handle user identification
  useEffect(() => {
    if (user) {
      // Get user plan from metadata or default to free
      const plan = user.user_metadata?.plan || 'free'
      
      identifyUser({
        id: user.id,
        email: user.email,
        plan,
        locale,
        createdAt: user.created_at
      })
    } else {
      clearUser()
    }
  }, [user, locale])

  // Track route changes
  useEffect(() => {
    const handleRouteChange = () => {
      if (typeof window !== 'undefined') {
        Analytics.pageView(window.location.pathname, locale)
      }
    }

    // Listen for popstate events (back/forward navigation)
    window.addEventListener('popstate', handleRouteChange)
    
    // Also track initial page load
    handleRouteChange()

    return () => {
      window.removeEventListener('popstate', handleRouteChange)
    }
  }, [locale])

  return (
    <AnalyticsContext.Provider value={Analytics}>
      {children}
    </AnalyticsContext.Provider>
  )
}

// Hook to use analytics in components
export function useAnalytics() {
  const context = useContext(AnalyticsContext)
  if (!context) {
    throw new Error('useAnalytics must be used within an AnalyticsProvider')
  }
  return context
}

// HOC for error boundary with analytics
export function withAnalyticsErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  componentName?: string
) {
  return function AnalyticsErrorBoundary(props: P) {
    useEffect(() => {
      // Set up error boundary for unhandled errors
      const handleError = (event: ErrorEvent) => {
        Analytics.ErrorTracking.uiError(
          event.error || event.message,
          componentName || Component.displayName || Component.name || 'UnknownComponent',
          undefined,
          {
            filename: event.filename,
            lineno: event.lineno,
            colno: event.colno
          }
        )
      }

      const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
        Analytics.ErrorTracking.uiError(
          event.reason,
          componentName || Component.displayName || Component.name || 'UnknownComponent',
          undefined,
          {
            type: 'unhandled_promise_rejection'
          }
        )
      }

      window.addEventListener('error', handleError)
      window.addEventListener('unhandledrejection', handleUnhandledRejection)

      return () => {
        window.removeEventListener('error', handleError)
        window.removeEventListener('unhandledrejection', handleUnhandledRejection)
      }
    }, [])

    return <Component {...props} />
  }
}

// Custom hook for tracking user interactions
export function useTrackInteraction() {
  const analytics = useAnalytics()
  
  return {
    trackClick: (element: string, metadata?: Record<string, any>) => {
      analytics.Performance.measureSync(
        `click_${element}`,
        'user_interaction',
        () => {
          // Track the interaction
          if (typeof window !== 'undefined') {
            const event = new CustomEvent('analytics_click', {
              detail: { element, metadata }
            })
            window.dispatchEvent(event)
          }
        }
      )
    },
    
    trackFormSubmit: (formName: string, success: boolean, metadata?: Record<string, any>) => {
      analytics.track('ui_interaction' as any, {
        type: 'form_submit',
        form_name: formName,
        success,
        ...metadata
      })
    },
    
    trackButtonClick: (buttonName: string, metadata?: Record<string, any>) => {
      analytics.track('ui_interaction' as any, {
        type: 'button_click',
        button_name: buttonName,
        ...metadata
      })
    }
  }
}

export default AnalyticsProvider