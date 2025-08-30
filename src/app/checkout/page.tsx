'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { 
  CreditCard, 
  Shield, 
  Check, 
  ArrowLeft,
  Lock,
  Star
} from 'lucide-react'
import { loadStripe } from '@stripe/stripe-js'

// 初始化 Stripe
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

export default function CheckoutPage() {
  const searchParams = useSearchParams()
  const [plan, setPlan] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [paymentMethod, setPaymentMethod] = useState<'stripe' | 'alipay' | 'wechat'>('stripe')

  useEffect(() => {
    setPlan(searchParams.get('plan'))
  }, [searchParams])

  const planDetails = {
    pro: {
      name: 'Pro 高级版',
      price: '$4.99',
      originalPrice: '$9.99',
      period: '每月',
      discount: '限时5折优惠',
      features: [
        '无限次 AI 解析',
        '完整题库访问（1300+题）',
        'SmartRouter AI 多模型',
        '高级OCR + 图片解析',
        '专业练习模式',
        '学习统计报告',
        '优先客服支持',
        '离线练习模式'
      ],
      color: 'blue'
    }
  }

  const currentPlan = planDetails[plan as keyof typeof planDetails]

  const handlePayment = async () => {
    if (!email || !currentPlan) return
    
    setLoading(true)

    try {
      // 创建支付会话
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          plan: plan,
          email: email,
          paymentMethod: paymentMethod
        }),
      })

      const session = await response.json()

      if (response.ok) {
        // 根据支付方式处理
        if (paymentMethod === 'stripe') {
          const stripe = await stripePromise
          if (stripe) {
            await stripe.redirectToCheckout({ sessionId: session.sessionId })
          }
        } else {
          // 支付宝或微信支付
          window.location.href = session.paymentUrl
        }
      } else {
        alert('支付创建失败：' + session.error)
      }
    } catch (error) {
      console.error('支付错误:', error)
      alert('支付过程中出现错误，请重试')
    } finally {
      setLoading(false)
    }
  }

  if (!currentPlan) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center">
            <h3 className="text-lg font-semibold mb-2">未选择套餐</h3>
            <p className="text-gray-600 mb-4">请先选择一个套餐</p>
            <Button onClick={() => window.location.href = '/pricing'}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              返回选择套餐
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="container mx-auto px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto"
        >
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">
              <span className="bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
                完成支付，开始Pro学习之旅
              </span>
            </h1>
            <p className="text-gray-600 text-lg">
              安全支付，30天无条件退款保证
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* 套餐详情 */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Card className="sticky top-8">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xl">{currentPlan.name}</CardTitle>
                    <Badge variant="secondary" className="bg-orange-100 text-orange-600">
                      {currentPlan.discount}
                    </Badge>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold text-blue-600">
                      {currentPlan.price}
                    </span>
                    <span className="text-lg text-gray-400 line-through">
                      {currentPlan.originalPrice}
                    </span>
                    <span className="text-gray-500">/ {currentPlan.period}</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <h4 className="font-semibold text-gray-900">包含功能：</h4>
                    <ul className="space-y-2">
                      {currentPlan.features.map((feature, index) => (
                        <li key={index} className="flex items-center">
                          <Check className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                          <span className="text-sm text-gray-700">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="mt-6 p-4 bg-green-50 rounded-lg border border-green-200">
                    <div className="flex items-center gap-2 mb-2">
                      <Shield className="h-4 w-4 text-green-600" />
                      <span className="font-medium text-green-800">安全保障</span>
                    </div>
                    <ul className="text-sm text-green-700 space-y-1">
                      <li>• 30天无条件退款</li>
                      <li>• 银行级别加密</li>
                      <li>• 随时取消订阅</li>
                      <li>• 数据安全保护</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* 支付表单 */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Lock className="h-5 w-5 mr-2" />
                    安全支付
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* 邮箱输入 */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">邮箱地址</label>
                    <Input
                      type="email"
                      placeholder="输入您的邮箱"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full"
                    />
                    <p className="text-xs text-gray-500">
                      用于接收订阅确认和发票
                    </p>
                  </div>

                  {/* 支付方式选择 */}
                  <div className="space-y-3">
                    <label className="text-sm font-medium">选择支付方式</label>
                    <div className="grid gap-3">
                      <div 
                        className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                          paymentMethod === 'stripe' 
                            ? 'border-blue-500 bg-blue-50' 
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => setPaymentMethod('stripe')}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <CreditCard className="h-5 w-5 mr-3" />
                            <div>
                              <div className="font-medium">信用卡/借记卡</div>
                              <div className="text-sm text-gray-500">Visa, Mastercard, American Express</div>
                            </div>
                          </div>
                          <div className="flex gap-1">
                            <div className="w-6 h-4 bg-blue-600 rounded-sm flex items-center justify-center">
                              <span className="text-white text-xs font-bold">V</span>
                            </div>
                            <div className="w-6 h-4 bg-red-600 rounded-sm flex items-center justify-center">
                              <span className="text-white text-xs font-bold">M</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div 
                        className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                          paymentMethod === 'alipay' 
                            ? 'border-blue-500 bg-blue-50' 
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => setPaymentMethod('alipay')}
                      >
                        <div className="flex items-center">
                          <div className="w-5 h-5 mr-3 bg-blue-500 rounded"></div>
                          <div>
                            <div className="font-medium">支付宝</div>
                            <div className="text-sm text-gray-500">扫码支付，安全便捷</div>
                          </div>
                        </div>
                      </div>

                      <div 
                        className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                          paymentMethod === 'wechat' 
                            ? 'border-blue-500 bg-blue-50' 
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => setPaymentMethod('wechat')}
                      >
                        <div className="flex items-center">
                          <div className="w-5 h-5 mr-3 bg-green-500 rounded"></div>
                          <div>
                            <div className="font-medium">微信支付</div>
                            <div className="text-sm text-gray-500">微信扫码支付</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 支付按钮 */}
                  <Button
                    onClick={handlePayment}
                    disabled={!email || loading}
                    className="w-full py-6 text-lg font-semibold"
                    size="lg"
                  >
                    {loading ? '处理中...' : `立即支付 ${currentPlan.price}`}
                  </Button>

                  {/* 免责声明 */}
                  <div className="text-center space-y-2">
                    <p className="text-xs text-gray-500">
                      点击支付即表示您同意我们的 
                      <a href="/terms" className="text-blue-600 hover:underline">服务条款</a> 和 
                      <a href="/privacy" className="text-blue-600 hover:underline">隐私政策</a>
                    </p>
                    <div className="flex items-center justify-center gap-4 text-xs text-gray-400">
                      <div className="flex items-center">
                        <Shield className="h-3 w-3 mr-1" />
                        SSL加密
                      </div>
                      <div className="flex items-center">
                        <Star className="h-3 w-3 mr-1" />
                        30天退款
                      </div>
                    </div>
                  </div>

                  {/* 返回链接 */}
                  <div className="text-center">
                    <Button 
                      variant="ghost" 
                      onClick={() => window.location.href = '/pricing'}
                      className="text-sm"
                    >
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      返回选择其他套餐
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}