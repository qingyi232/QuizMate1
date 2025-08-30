'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { authBrowser } from '@/lib/auth/auth-browser'
import { Eye, EyeOff, Mail, Lock, AlertCircle, Chrome, User, CheckCircle, Loader2, Smartphone, MessageCircle } from 'lucide-react'

function RegisterPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get('redirect_to') || '/dashboard'
  const plan = searchParams.get('plan') || 'free'
  
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  })

  useEffect(() => {
    // Check if user is already logged in
    authBrowser.getSession().then(({ session }) => {
      if (session) {
        router.push(redirectTo)
      }
    })
  }, [router, redirectTo])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (error) setError('')
    if (success) setSuccess('')
  }

  const validateForm = () => {
    if (!formData.name.trim()) {
      setError('Name is required')
      return false
    }
    if (!formData.email) {
      setError('Email is required')
      return false
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters')
      return false
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      return false
    }
    return true
  }

  const handleEmailSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return

    setIsLoading(true)
    setError('')
    setSuccess('')

    try {
      const result = await authBrowser.signUp(formData.email, formData.password)
      
      if (!result.success) {
        setError(result.error || 'Registration failed')
        return
      }

      if (result.user) {
        if (result.user.email_confirmed_at) {
          // Email already confirmed, redirect
          router.push(redirectTo)
        } else {
          // 检查是否为演示模式
          if (result.user.id === 'demo-user-id') {
            // 演示模式：直接跳转到dashboard
            console.log('演示模式：注册成功，跳转到dashboard')
            router.push(redirectTo)
          } else {
            // 真实模式：显示邮箱确认消息
            setSuccess(
              'Account created successfully! Please check your email to confirm your account.'
            )
          }
        }
      }
    } catch (err) {
      setError('An unexpected error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleSignUp = async () => {
    setIsLoading(true)
    setError('')

    try {
      const result = await authBrowser.signInWithGoogle(redirectTo)
      
      if (!result.success) {
        setError(result.error || 'Failed to sign up with Google')
        setIsLoading(false)
      }
      // Don't set loading to false here as user will be redirected
    } catch (err) {
      setError('Failed to sign up with Google')
      setIsLoading(false)
    }
  }

  const handleWeChatSignUp = async () => {
    setIsLoading(true)
    setError('')

    try {
      const result = await authBrowser.signInWithWeChat(redirectTo)
      
      if (!result.success) {
        setError(result.error || 'Failed to sign up with WeChat')
        setIsLoading(false)
      }
      // Don't set loading to false here as user will be redirected
    } catch (err) {
      setError('Failed to sign up with WeChat')
      setIsLoading(false)
    }
  }

  const handleQQSignUp = async () => {
    setIsLoading(true)
    setError('')

    try {
      const result = await authBrowser.signInWithQQ(redirectTo)
      
      if (!result.success) {
        setError(result.error || 'Failed to sign up with QQ')
        setIsLoading(false)
      }
      // Don't set loading to false here as user will be redirected
    } catch (err) {
      setError('Failed to sign up with QQ')
      setIsLoading(false)
    }
  }

  const isFormValid = formData.name && formData.email && formData.password && formData.confirmPassword

  return (
    <Card className="border-0 shadow-xl">
      <CardHeader className="space-y-1 text-center">
        <CardTitle className="text-2xl font-bold">Create your account</CardTitle>
        <CardDescription>
          Join thousands of students learning with AI
        </CardDescription>
        {plan === 'pro' && (
          <Badge className="w-fit mx-auto">
            Pro Plan - Unlimited Questions
          </Badge>
        )}
      </CardHeader>
      
      <CardContent className="space-y-6">
        {success && (
          <div className="flex items-center space-x-2 text-sm text-green-600 bg-green-50 p-3 rounded-md">
            <CheckCircle className="h-4 w-4" />
            <span>{success}</span>
          </div>
        )}

        {/* 快速登录选项 */}
        <div className="grid grid-cols-2 gap-3">
          <Button
            variant="outline"
            onClick={handleGoogleSignUp}
            disabled={isLoading}
            className="h-12 text-sm"
          >
            <Chrome className="mr-2 h-4 w-4" />
            Google
          </Button>
          
          <Button
            variant="outline"
            onClick={handleWeChatSignUp}
            disabled={isLoading}
            className="h-12 text-sm bg-green-50 hover:bg-green-100 text-green-700 border-green-200"
          >
            <MessageCircle className="mr-2 h-4 w-4" />
            微信
          </Button>
          
          <Button
            variant="outline"
            onClick={handleQQSignUp}
            disabled={isLoading}
            className="h-12 text-sm bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200"
          >
            <div className="mr-2 h-4 w-4 rounded-full bg-blue-600 flex items-center justify-center">
              <span className="text-xs text-white font-bold">Q</span>
            </div>
            QQ
          </Button>
          
          <Button
            variant="outline"
            onClick={() => router.push('/auth/phone-login')}
            disabled={isLoading}
            className="h-12 text-sm"
          >
            <Smartphone className="mr-2 h-4 w-4" />
            手机号
          </Button>
        </div>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
          </div>
        </div>

        {/* Email Sign Up Form */}
        <form onSubmit={handleEmailSignUp} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="name" className="text-sm font-medium">
              Full Name
            </label>
            <div className="relative">
              <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="name"
                name="name"
                type="text"
                placeholder="Enter your full name"
                value={formData.name}
                onChange={handleInputChange}
                className="pl-10 h-12"
                required
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleInputChange}
                className="pl-10 h-12"
                required
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Create a password (min. 6 characters)"
                value={formData.password}
                onChange={handleInputChange}
                className="pl-10 pr-10 h-12"
                required
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                disabled={isLoading}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="confirmPassword" className="text-sm font-medium">
              Confirm Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="Confirm your password"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                className="pl-10 pr-10 h-12"
                required
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                disabled={isLoading}
              >
                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {error && (
            <div className="flex items-center space-x-2 text-sm text-destructive bg-destructive/10 p-3 rounded-md">
              <AlertCircle className="h-4 w-4" />
              <span>{error}</span>
            </div>
          )}

          <div className="text-xs text-muted-foreground">
            By creating an account, you agree to our{' '}
            <Link href="/terms" className="text-blue-600 hover:underline">
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link href="/privacy" className="text-blue-600 hover:underline">
              Privacy Policy
            </Link>
          </div>

          <Button
            type="submit"
            disabled={!isFormValid || isLoading}
            className="w-full h-12 text-base"
          >
            {isLoading ? 'Creating account...' : 'Create account'}
          </Button>
        </form>

        {/* Sign In Link */}
        <div className="text-center space-y-2">
          <p className="text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link
              href="/auth/login"
              className="text-blue-600 hover:underline font-medium"
            >
              Sign in
            </Link>
          </p>
          
          <div className="flex items-center justify-center space-x-2">
            <Badge variant="secondary" className="text-xs">
              Free plan includes 5 questions/day
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default function RegisterPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-600" />
          <div className="text-lg font-semibold">Loading...</div>
        </div>
      </div>
    }>
      <RegisterPageContent />
    </Suspense>
  )
}