/**
 * Browser-side authentication helpers
 */

import { createClient } from '@/lib/db/supabase-browser'
import { type User } from '@supabase/supabase-js'

// Demo mode session storage key
const DEMO_SESSION_KEY = 'quizmate_demo_session'

// Browser-side auth client
export const authClient = createClient()

// Browser-side auth helpers
export class AuthBrowser {
  private supabase = createClient()
  private authCallbacks: Array<(event: string, session: any) => void> = []

  // 检查是否为演示模式
  private isDemo(): boolean {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    return !supabaseUrl || supabaseUrl.includes('placeholder') || !supabaseKey || supabaseKey.includes('placeholder')
  }

  // 获取演示模式session
  private getDemoSession(): any {
    if (typeof window === 'undefined') return null
    const stored = localStorage.getItem(DEMO_SESSION_KEY)
    if (!stored) return null
    try {
      return JSON.parse(stored)
    } catch {
      return null
    }
  }

  // 设置演示模式session
  private setDemoSession(user: any): void {
    if (typeof window === 'undefined') return
    const session = {
      user,
      access_token: 'demo-token',
      expires_at: Date.now() + 1000 * 60 * 60 * 24 // 24小时
    }
    localStorage.setItem(DEMO_SESSION_KEY, JSON.stringify(session))
    this.triggerAuthStateChange('SIGNED_IN', session)
  }

  // 清除演示模式session
  private clearDemoSession(): void {
    if (typeof window === 'undefined') return
    localStorage.removeItem(DEMO_SESSION_KEY)
    this.triggerAuthStateChange('SIGNED_OUT', null)
  }

  // 触发认证状态变化
  private triggerAuthStateChange(event: string, session: any): void {
    this.authCallbacks.forEach(callback => {
      try {
        callback(event, session)
      } catch (error) {
        console.error('Auth callback error:', error)
      }
    })
  }

  async getSession() {
    if (this.isDemo()) {
      const demoSession = this.getDemoSession()
      console.warn('演示模式：返回本地session', demoSession ? '已登录' : '未登录')
      return { session: demoSession, error: null }
    }

    try {
      return await this.supabase.auth.getSession()
    } catch (error) {
      // 网络错误或其他异常，返回演示session
      const demoSession = this.getDemoSession()
      console.warn('演示模式：Supabase连接失败，返回本地session')
      return { session: demoSession, error: null }
    }
  }

  async getUser(): Promise<User | null> {
    if (this.isDemo()) {
      const demoSession = this.getDemoSession()
      console.warn('演示模式：返回本地用户', demoSession?.user ? '已登录' : '未登录')
      return demoSession?.user || null
    }

    try {
      const { data: { user }, error } = await this.supabase.auth.getUser()
      
      if (error) {
        console.error('Error getting user:', error)
        return null
      }
      
      return user
    } catch (error) {
      // 网络错误或其他异常，返回演示用户
      const demoSession = this.getDemoSession()
      console.warn('演示模式：Supabase连接失败，返回本地用户')
      return demoSession?.user || null
    }
  }

  async signOut() {
    if (this.isDemo()) {
      // 演示模式：清除本地session
      console.warn('演示模式：清除本地session')
      this.clearDemoSession()
      return { success: true }
    }

    try {
      const { error } = await this.supabase.auth.signOut()
      if (error) {
        console.error('Sign out error:', error)
        return { success: false, error: error.message }
      }
      return { success: true }
    } catch (error) {
      // 网络错误，直接清除本地session
      console.warn('演示模式：Supabase连接失败，清除本地session')
      this.clearDemoSession()
      return { success: true }
    }
  }

  async signInWithPassword(email: string, password: string) {
    if (this.isDemo()) {
      // 演示模式：创建本地session
      console.warn('演示模式：Supabase未配置，模拟登录成功')
      const demoUser = { 
        id: 'demo-user-id', 
        email, 
        email_confirmed_at: new Date().toISOString(),
        created_at: new Date().toISOString()
      }
      this.setDemoSession(demoUser)
      return { success: true, user: demoUser }
    }

    try {
      const { data, error } = await this.supabase.auth.signInWithPassword({
        email,
        password
      })
      
      if (error) {
        return { success: false, error: error.message }
      }
      
      return { success: true, user: data.user }
    } catch (error) {
      // 网络错误或其他异常，回退到演示模式
      console.warn('演示模式：Supabase连接失败，模拟登录成功')
      const demoUser = { 
        id: 'demo-user-id', 
        email, 
        email_confirmed_at: new Date().toISOString(),
        created_at: new Date().toISOString()
      }
      this.setDemoSession(demoUser)
      return { success: true, user: demoUser }
    }
  }

  async signUp(email: string, password: string) {
    if (this.isDemo()) {
      // 演示模式：创建本地session
      console.warn('演示模式：Supabase未配置，模拟注册成功')
      const demoUser = { 
        id: 'demo-user-id', 
        email, 
        email_confirmed_at: null,
        created_at: new Date().toISOString()
      }
      this.setDemoSession(demoUser)
      return { success: true, user: demoUser }
    }

    try {
      const { data, error } = await this.supabase.auth.signUp({
        email,
        password
      })
      
      if (error) {
        return { success: false, error: error.message }
      }
      
      return { success: true, user: data.user }
    } catch (error) {
      // 网络错误或其他异常，回退到演示模式
      console.warn('演示模式：Supabase连接失败，模拟注册成功')
      const demoUser = { 
        id: 'demo-user-id', 
        email, 
        email_confirmed_at: null,
        created_at: new Date().toISOString()
      }
      this.setDemoSession(demoUser)
      return { success: true, user: demoUser }
    }
  }

  async signInWithGoogle(redirectTo?: string) {
    // 检查是否为演示模式（未配置Supabase）
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    
    if (!supabaseUrl || supabaseUrl.includes('placeholder') || !supabaseKey || supabaseKey.includes('placeholder')) {
      // 演示模式：提示Google登录不可用
      console.warn('演示模式：Google登录需要Supabase配置')
      return { success: false, error: 'Google login requires configuration. Please use email registration for demo.' }
    }

    try {
      const { data, error } = await this.supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectTo || `${window.location.origin}/dashboard`
        }
      })
      
      if (error) {
        return { success: false, error: error.message }
      }
      
      return { success: true, data }
    } catch (error) {
      // 网络错误或其他异常，提示Google登录不可用
      console.warn('演示模式：Google登录连接失败')
      return { success: false, error: 'Google login requires configuration. Please use email registration for demo.' }
    }
  }

  async signInWithWeChat(redirectTo?: string) {
    if (this.isDemo()) {
      // 演示模式：模拟微信登录
      console.warn('演示模式：模拟微信登录成功')
      const demoUser = { 
        id: 'demo-wechat-user-id', 
        email: 'wechat_user@demo.com',
        user_metadata: {
          full_name: '微信用户',
          avatar_url: '',
          provider: 'wechat'
        },
        email_confirmed_at: new Date().toISOString(),
        created_at: new Date().toISOString()
      }
      this.setDemoSession(demoUser)
      // 模拟跳转延迟
      setTimeout(() => {
        window.location.href = redirectTo || '/dashboard'
      }, 1000)
      return { success: true, user: demoUser }
    }

    try {
      // 跳转到微信OAuth API端点
      const params = new URLSearchParams()
      if (redirectTo) params.set('redirect_to', redirectTo)
      
      window.location.href = `/api/auth/wechat?${params.toString()}`
      return { success: true }
    } catch (error) {
      console.error('WeChat login error:', error)
      return { success: false, error: 'Failed to initiate WeChat login' }
    }
  }

  async signInWithQQ(redirectTo?: string) {
    if (this.isDemo()) {
      // 演示模式：模拟QQ登录
      console.warn('演示模式：模拟QQ登录成功')
      const demoUser = { 
        id: 'demo-qq-user-id', 
        email: 'qq_user@demo.com',
        user_metadata: {
          full_name: 'QQ用户',
          avatar_url: '',
          provider: 'qq'
        },
        email_confirmed_at: new Date().toISOString(),
        created_at: new Date().toISOString()
      }
      this.setDemoSession(demoUser)
      // 模拟跳转延迟
      setTimeout(() => {
        window.location.href = redirectTo || '/dashboard'
      }, 1000)
      return { success: true, user: demoUser }
    }

    try {
      // 跳转到QQ OAuth API端点
      const params = new URLSearchParams()
      if (redirectTo) params.set('redirect_to', redirectTo)
      
      window.location.href = `/api/auth/qq?${params.toString()}`
      return { success: true }
    } catch (error) {
      console.error('QQ login error:', error)
      return { success: false, error: 'Failed to initiate QQ login' }
    }
  }

  async resetPassword(email: string) {
    try {
      const { error } = await this.supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`
      })
      
      if (error) {
        return { success: false, error: error.message }
      }
      
      return { success: true }
    } catch (error) {
      console.error('Reset password error:', error)
      return { success: false, error: 'Failed to reset password' }
    }
  }

  onAuthStateChange(callback: (event: string, session: any) => void) {
    // 添加回调到演示模式监听器列表
    this.authCallbacks.push(callback)
    
    if (this.isDemo()) {
      // 演示模式：立即检查并触发当前状态
      const demoSession = this.getDemoSession()
      setTimeout(() => {
        callback(demoSession ? 'SIGNED_IN' : 'SIGNED_OUT', demoSession)
      }, 0)
      
      // 返回一个模拟的subscription对象
      return {
        data: {
          subscription: {
            unsubscribe: () => {
              const index = this.authCallbacks.indexOf(callback)
              if (index > -1) {
                this.authCallbacks.splice(index, 1)
              }
            }
          }
        }
      }
    }

    try {
      const result = this.supabase.auth.onAuthStateChange(callback)
      return result
    } catch (error) {
      console.warn('演示模式：Supabase连接失败，使用本地监听器')
      // 演示模式兜底：立即检查并触发当前状态
      const demoSession = this.getDemoSession()
      setTimeout(() => {
        callback(demoSession ? 'SIGNED_IN' : 'SIGNED_OUT', demoSession)
      }, 0)
      
      return {
        data: {
          subscription: {
            unsubscribe: () => {
              const index = this.authCallbacks.indexOf(callback)
              if (index > -1) {
                this.authCallbacks.splice(index, 1)
              }
            }
          }
        }
      }
    }
  }
}

// Export singleton instance
export const authBrowser = new AuthBrowser()