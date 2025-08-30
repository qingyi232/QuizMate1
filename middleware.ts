/**
 * Next.js middleware for i18n and route protection
 */

import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import createMiddleware from 'next-intl/middleware'
import { locales, defaultLocale } from './src/lib/i18n/config'

// Create the next-intl middleware
const intlMiddleware = createMiddleware({
  locales,
  defaultLocale,
  localePrefix: 'as-needed', // Only add locale prefix when not default
  pathnames: {
    '/': '/',
    '/quiz': '/quiz',
    '/dashboard': '/dashboard', 
    '/settings': '/settings',
    '/auth/login': '/auth/login',
    '/auth/register': '/auth/register',
    '/auth/reset': '/auth/reset',
    '/auth/reset-password': '/auth/reset-password',
    '/auth/callback': '/auth/callback',
    '/pricing': '/pricing',
    '/faq': '/faq'
  }
})

export async function middleware(request: NextRequest) {
  // Skip i18n for API routes and static files
  const pathname = request.nextUrl.pathname
  if (
    pathname.startsWith('/api/') ||
    pathname.startsWith('/_next/') ||
    pathname.includes('.') ||
    pathname.startsWith('/favicon')
  ) {
    return NextResponse.next()
  }

  // First handle i18n routing
  const intlResponse = intlMiddleware(request)
  
  // If intl middleware redirects, return that response
  if (intlResponse.status === 302 || intlResponse.status === 307) {
    return intlResponse
  }

  // Create a new response based on the intl response
  let response = new NextResponse(intlResponse.body, {
    status: intlResponse.status,
    statusText: intlResponse.statusText,
    headers: intlResponse.headers,
  })

  try {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
            response = new NextResponse(intlResponse.body, {
              status: intlResponse.status,
              statusText: intlResponse.statusText,
              headers: intlResponse.headers,
            })
            cookiesToSet.forEach(({ name, value, options }) =>
              response.cookies.set(name, value, options)
            )
          },
        },
      }
    )

    // Check auth status
    const { data: { user }, error } = await supabase.auth.getUser()
    
    // Get the pathname without locale prefix for route matching
    const pathnameWithoutLocale = pathname.replace(/^\/[a-z]{2,3}(?=\/|$)/, '') || '/'
    
    const isAuthPage = pathnameWithoutLocale.startsWith('/auth')
    const isProtectedPage = pathnameWithoutLocale.startsWith('/dashboard') ||
                            pathnameWithoutLocale.startsWith('/quiz') ||
                            pathnameWithoutLocale.startsWith('/settings')

    // Redirect authenticated users away from auth pages
    if (user && isAuthPage && !pathnameWithoutLocale.includes('/callback')) {
      const redirectTo = request.nextUrl.searchParams.get('redirect_to') || '/dashboard'
      return NextResponse.redirect(new URL(redirectTo, request.url))
    }

    // Redirect unauthenticated users to login for protected pages
    if (!user && isProtectedPage) {
      const loginUrl = new URL('/auth/login', request.url)
      loginUrl.searchParams.set('redirect_to', pathnameWithoutLocale)
      return NextResponse.redirect(loginUrl)
    }

    return response
  } catch (error) {
    console.error('Middleware error:', error)
    return response
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - api/ (API routes)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|api/|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}