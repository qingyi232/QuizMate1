'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import SafeLogo from '@/components/safe-logo'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { authBrowser } from '@/lib/auth/auth-browser'
import { Menu, X, User, LogOut } from 'lucide-react'
import LanguageSwitcher from '@/components/language-switcher'
import { type User } from '@supabase/supabase-js'

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isClient, setIsClient] = useState(false)
  const router = useRouter()

  useEffect(() => {
    // Set client flag to prevent hydration mismatch
    setIsClient(true)
    
    // Get initial session
    authBrowser.getSession().then(({ session }) => {
      setUser(session?.user ?? null)
      setIsLoading(false)
    })

    // Listen for auth changes
    const { data: { subscription } } = authBrowser.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null)
      setIsLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleSignOut = async () => {
    const result = await authBrowser.signOut()
    if (result.success) {
      router.push('/')
    }
  }

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-3">
                      <SafeLogo size={40} />
          <div className="flex flex-col">
            <span className="text-2xl font-extrabold bg-gradient-to-r from-blue-600 via-green-500 to-blue-600 bg-clip-text text-transparent">
              QuizMate
            </span>
            <Badge variant="secondary" className="hidden sm:inline-flex text-xs font-medium bg-gradient-to-r from-blue-500/10 to-green-500/10 text-blue-600 border-0">
              AI 学习助手
            </Badge>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-6">
          <Link 
            href="/quiz" 
            className="text-sm font-semibold text-gray-600 hover:text-blue-600 transition-colors px-3 py-2 rounded-lg hover:bg-blue-500/5"
          >
            智能解析
          </Link>
          <Link 
            href="/questions" 
            className="text-sm font-semibold text-gray-600 hover:text-blue-600 transition-colors px-3 py-2 rounded-lg hover:bg-blue-500/5"
          >
            题库中心
          </Link>
          <Link 
            href="/dashboard" 
            className="text-sm font-semibold text-gray-600 hover:text-blue-600 transition-colors px-3 py-2 rounded-lg hover:bg-blue-500/5"
          >
            学习空间
          </Link>
          <Link 
            href="/pricing" 
            className="text-sm font-semibold text-gray-600 hover:text-blue-600 transition-colors px-3 py-2 rounded-lg hover:bg-blue-500/5"
          >
            定价方案
          </Link>
          <Link 
            href="/paypal-subscription" 
            className="text-sm font-semibold text-gray-600 hover:text-blue-600 transition-colors px-3 py-2 rounded-lg hover:bg-blue-500/5"
          >
            PayPal订阅
          </Link>
          
          {/* Language Selector */}
          <LanguageSwitcher />
        </div>

        {/* Auth Buttons */}
        <div className="hidden md:flex items-center space-x-3">
          {!isClient ? (
            // 服务端渲染时显示占位符
            <div className="w-24 h-9 bg-muted animate-pulse rounded-md" />
          ) : isLoading ? (
            // 客户端加载中显示占位符
            <div className="w-24 h-9 bg-muted animate-pulse rounded-md" />
          ) : user ? (
            <>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/dashboard">
                  <User className="h-4 w-4 mr-2" />
                  Dashboard
                </Link>
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleSignOut}
                className="text-muted-foreground"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" size="sm" asChild className="font-semibold text-gray-600 hover:text-blue-600">
                <Link href="/auth/login">登录</Link>
              </Button>
              <Button size="sm" asChild className="bg-gradient-to-r from-blue-600 to-green-500 text-white shadow-lg hover:shadow-xl font-semibold rounded-xl">
                <Link href="/auth/register">免费开始</Link>
              </Button>
            </>
          )}
        </div>

        {/* Mobile menu button */}
        <button
          className="md:hidden"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Toggle menu"
        >
          {isMenuOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <Menu className="h-6 w-6" />
          )}
        </button>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden border-t bg-background">
          <div className="container px-4 py-4 space-y-4">
            <div className="flex flex-col space-y-3">
              <Link 
                href="/quiz"
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Create Quiz
              </Link>
              <Link 
                href="/dashboard"
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Dashboard
              </Link>
              <Link 
                href="/pricing"
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Pricing
              </Link>
            </div>
            
            {/* Mobile Language Selector */}
            <Select defaultValue="en">
              <SelectTrigger className="w-full">
                <Globe className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="id">Bahasa Indonesia</SelectItem>
                <SelectItem value="fil">Filipino</SelectItem>
                <SelectItem value="sw">Kiswahili</SelectItem>
              </SelectContent>
            </Select>
            
            {/* Mobile Auth Buttons */}
            <div className="flex flex-col space-y-2 pt-4 border-t">
              {!isClient ? (
                // 服务端渲染时显示占位符
                <div className="space-y-2">
                  <div className="h-9 bg-muted animate-pulse rounded-md" />
                  <div className="h-9 bg-muted animate-pulse rounded-md" />
                </div>
              ) : isLoading ? (
                // 客户端加载中显示占位符
                <div className="space-y-2">
                  <div className="h-9 bg-muted animate-pulse rounded-md" />
                  <div className="h-9 bg-muted animate-pulse rounded-md" />
                </div>
              ) : user ? (
                <>
                  <Button variant="outline" size="sm" asChild>
                    <Link href="/dashboard" onClick={() => setIsMenuOpen(false)}>
                      <User className="h-4 w-4 mr-2" />
                      Dashboard
                    </Link>
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => {
                      handleSignOut()
                      setIsMenuOpen(false)
                    }}
                    className="text-muted-foreground"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="outline" size="sm" asChild>
                    <Link href="/auth/login">Sign In</Link>
                  </Button>
                  <Button size="sm" asChild>
                    <Link href="/auth/register">Get Started</Link>
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}