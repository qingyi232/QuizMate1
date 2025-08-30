import { createClient } from '@/lib/db/supabase-server'
import { createClient as createBrowserClient } from '@/lib/db/supabase-browser'
import { redirect } from 'next/navigation'
import { type User } from '@supabase/supabase-js'

// Server-side auth helpers
export async function getCurrentUser(): Promise<User | null> {
  const supabase = await createClient()
  
  try {
    const { data: { user }, error } = await supabase.auth.getUser()
    
    if (error) {
      console.error('Error getting user:', error)
      return null
    }
    
    return user
  } catch (error) {
    console.error('Auth error:', error)
    return null
  }
}

export async function requireAuth(redirectTo: string = '/auth/login') {
  const user = await getCurrentUser()
  
  if (!user) {
    redirect(redirectTo)
  }
  
  return user
}

export async function requireNoAuth(redirectTo: string = '/dashboard') {
  const user = await getCurrentUser()
  
  if (user) {
    redirect(redirectTo)
  }
}

// Client-side auth helpers
export class AuthClient {
  private supabase = createBrowserClient()

  async signUp(email: string, password: string, metadata?: Record<string, any>) {
    const { data, error } = await this.supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata
      }
    })
    
    return { data, error }
  }

  async signIn(email: string, password: string) {
    const { data, error } = await this.supabase.auth.signInWithPassword({
      email,
      password
    })
    
    return { data, error }
  }

  async signInWithGoogle(redirectTo?: string) {
    const { data, error } = await this.supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: redirectTo ? `${window.location.origin}/auth/callback?redirect_to=${encodeURIComponent(redirectTo)}` : `${window.location.origin}/auth/callback`
      }
    })
    
    return { data, error }
  }

  async signOut() {
    const { error } = await this.supabase.auth.signOut()
    return { error }
  }

  async resetPassword(email: string) {
    const { data, error } = await this.supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`
    })
    
    return { data, error }
  }

  async updatePassword(password: string) {
    const { data, error } = await this.supabase.auth.updateUser({
      password
    })
    
    return { data, error }
  }

  async getSession() {
    const { data: { session }, error } = await this.supabase.auth.getSession()
    return { session, error }
  }

  onAuthStateChange(callback: (event: string, session: any) => void) {
    return this.supabase.auth.onAuthStateChange(callback)
  }
}

// Singleton instance
export const authClient = new AuthClient()

// Auth state management helpers
export function getAuthRedirectUrl(currentPath: string) {
  if (currentPath.startsWith('/auth')) {
    return '/dashboard'
  }
  return currentPath
}

export function getLoginRedirectUrl(intendedPath?: string) {
  const redirect = intendedPath && !intendedPath.startsWith('/auth') 
    ? `?redirect_to=${encodeURIComponent(intendedPath)}`
    : ''
  return `/auth/login${redirect}`
}

// Protected route wrapper for server components
export async function withAuth<T extends any[]>(
  handler: (user: User, ...args: T) => Promise<any>,
  redirectTo: string = '/auth/login'
) {
  return async (...args: T) => {
    const user = await getCurrentUser()
    
    if (!user) {
      redirect(redirectTo)
    }
    
    return handler(user, ...args)
  }
}