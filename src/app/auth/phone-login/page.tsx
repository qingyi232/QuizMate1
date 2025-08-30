'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Smartphone, Mail, MessageCircle, ArrowLeft, Shield, Clock } from 'lucide-react'
import Link from 'next/link'

export default function PhoneLoginPage() {
  const router = useRouter()
  const [phone, setPhone] = useState('')
  const [code, setCode] = useState('')
  const [codeSent, setCodeSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [countdown, setCountdown] = useState(0)
  const [error, setError] = useState('')

  // 验证手机号格式
  const isValidPhone = (phone: string) => /^1[3-9]\d{9}$/.test(phone)

  // 发送验证码
  const sendCode = async () => {
    if (!isValidPhone(phone)) {
      setError('请输入正确的手机号码')
      return
    }

    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/auth/send-sms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || '验证码发送失败')
      }

      setCodeSent(true)
      setCountdown(60)

      // 开发环境显示验证码
      if (process.env.NODE_ENV === 'development' && data.devCode) {
        console.log(`验证码: ${data.devCode}`)
        alert(`开发环境验证码: ${data.devCode}`)
      }

      // 倒计时
      const timer = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(timer)
            return 0
          }
          return prev - 1
        })
      }, 1000)

    } catch (error: any) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  // 验证登录
  const handleLogin = async () => {
    if (!isValidPhone(phone)) {
      setError('请输入正确的手机号码')
      return
    }

    if (!/^\d{6}$/.test(code)) {
      setError('请输入6位数字验证码')
      return
    }

    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/auth/phone-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, code })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || '登录失败')
      }

      // 登录成功，跳转到仪表板
      router.push('/dashboard')

    } catch (error: any) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* 返回按钮 */}
        <div className="mb-6">
          <Link href="/auth/register" className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900">
            <ArrowLeft className="h-4 w-4 mr-1" />
            返回登录选择
          </Link>
        </div>

        <Card className="shadow-lg">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mb-4">
              <Smartphone className="h-6 w-6 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold">手机号登录</CardTitle>
            <CardDescription>
              {!codeSent 
                ? '输入手机号，我们将发送验证码' 
                : '请输入6位数字验证码'
              }
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-4">
            {/* 手机号输入 */}
            <div>
              <Label htmlFor="phone">手机号码</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="请输入11位手机号"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 11))}
                disabled={codeSent}
                className={codeSent ? 'bg-gray-50' : ''}
              />
            </div>

            {/* 验证码输入 */}
            {codeSent && (
              <div>
                <Label htmlFor="code">验证码</Label>
                <div className="flex space-x-2">
                  <Input
                    id="code"
                    type="text"
                    placeholder="6位数字验证码"
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    maxLength={6}
                  />
                  <Button
                    variant="outline"
                    onClick={sendCode}
                    disabled={countdown > 0 || loading}
                    className="min-w-[100px]"
                  >
                    {countdown > 0 ? `${countdown}s` : '重新发送'}
                  </Button>
                </div>
              </div>
            )}

            {/* 错误提示 */}
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            {/* 操作按钮 */}
            <div className="space-y-3">
              {!codeSent ? (
                <Button
                  onClick={sendCode}
                  disabled={!isValidPhone(phone) || loading}
                  className="w-full"
                >
                  {loading ? '正在发送...' : '发送验证码'}
                </Button>
              ) : (
                <Button
                  onClick={handleLogin}
                  disabled={!code || code.length !== 6 || loading}
                  className="w-full"
                >
                  {loading ? '登录中...' : '确认登录'}
                </Button>
              )}

              {codeSent && (
                <Button
                  variant="outline"
                  onClick={() => {
                    setCodeSent(false)
                    setCode('')
                    setError('')
                    setCountdown(0)
                  }}
                  className="w-full"
                >
                  重新输入手机号
                </Button>
              )}
            </div>

            <Separator />

            {/* 安全提示 */}
            <div className="space-y-3">
              <div className="flex items-center text-sm text-gray-600">
                <Shield className="h-4 w-4 mr-2 text-green-600" />
                <span>验证码短信免费，请放心接收</span>
              </div>
              
              <div className="flex items-center text-sm text-gray-600">
                <Clock className="h-4 w-4 mr-2 text-blue-600" />
                <span>验证码5分钟内有效</span>
              </div>
            </div>

            {/* 其他登录方式 */}
            <div className="text-center">
              <p className="text-sm text-gray-500 mb-3">其他登录方式</p>
              <div className="grid grid-cols-1 gap-2">
                <Link href="/auth/register">
                  <Button variant="outline" size="sm" className="w-full">
                    <Mail className="h-4 w-4 mr-2" />
                    邮箱登录
                  </Button>
                </Link>
                <div className="grid grid-cols-2 gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      // 导入认证库并调用微信登录
                      import('@/lib/auth/auth-browser').then(({ authBrowser }) => {
                        authBrowser.signInWithWeChat()
                      })
                    }}
                    className="bg-green-50 hover:bg-green-100 text-green-700 border-green-200"
                  >
                    <MessageCircle className="h-4 w-4 mr-2" />
                    微信登录
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      // 导入认证库并调用QQ登录
                      import('@/lib/auth/auth-browser').then(({ authBrowser }) => {
                        authBrowser.signInWithQQ()
                      })
                    }}
                    className="bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200"
                  >
                    <div className="h-4 w-4 mr-2 rounded-full bg-blue-600 flex items-center justify-center">
                      <span className="text-xs text-white font-bold">Q</span>
                    </div>
                    QQ登录
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 用户协议 */}
        <p className="text-center text-xs text-gray-500 mt-6">
          登录即表示您同意
          <Link href="/terms" className="text-blue-600 hover:underline">《服务条款》</Link>
          和
          <Link href="/privacy" className="text-blue-600 hover:underline">《隐私政策》</Link>
        </p>
      </div>
    </div>
  )
}