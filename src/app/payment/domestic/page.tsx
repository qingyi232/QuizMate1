'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { CheckCircle, Smartphone, QrCode, CreditCard, AlertTriangle } from 'lucide-react'
import Image from 'next/image'

type PaymentMethod = 'alipay' | 'wechat' | null

function DomesticPaymentContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>(null)
  const [loading, setLoading] = useState(false)
  const [qrCodeUrl, setQrCodeUrl] = useState('')
  const [orderId, setOrderId] = useState('')
  const [paymentUrl, setPaymentUrl] = useState('')

  const plan = searchParams.get('plan') || 'pro_monthly'

  const planInfo = {
    pro_monthly: {
      name: 'Pro 高级版',
      price: '29.99',
      period: '月',
      features: [
        '无限次AI智能解析',
        '完整题库访问权限',
        'SmartRouter多模型支持',
        '高级统计分析',
        '优先客服支持'
      ]
    }
  }

  const currentPlan = planInfo[plan as keyof typeof planInfo]

  const handlePayment = async () => {
    if (!selectedMethod) return

    setLoading(true)
    try {
      const response = await fetch(`/api/payment/${selectedMethod}/create-order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || '支付订单创建失败')
      }

      setOrderId(data.orderId)

      if (selectedMethod === 'alipay') {
        // 支付宝跳转到支付页面
        window.location.href = data.paymentUrl
      } else if (selectedMethod === 'wechat') {
        // 微信支付显示二维码
        setQrCodeUrl(data.codeUrl)
      }

    } catch (error) {
      console.error('支付失败:', error)
      alert('支付订单创建失败，请稍后重试')
    } finally {
      setLoading(false)
    }
  }

  // 检查支付状态
  const checkPaymentStatus = async () => {
    if (!orderId) return

    try {
      const response = await fetch(`/api/payment/status/${orderId}`)
      const data = await response.json()

      if (data.status === 'paid') {
        router.push('/payment/success?domestic=true')
      }
    } catch (error) {
      console.error('支付状态检查失败:', error)
    }
  }

  useEffect(() => {
    if (orderId && selectedMethod === 'wechat') {
      const interval = setInterval(checkPaymentStatus, 3000)
      return () => clearInterval(interval)
    }
  }, [orderId, selectedMethod])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* 头部 */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">选择支付方式</h1>
          <p className="text-gray-600">安全便捷的国内支付，立即开启Pro版体验</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* 订单信息 */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>订单信息</CardTitle>
                <Badge variant="outline" className="bg-blue-50 text-blue-700">升级订阅</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="font-medium">{currentPlan?.name}</span>
                <span className="text-2xl font-bold text-blue-600">
                  ¥{currentPlan?.price}<span className="text-sm font-normal">/{currentPlan?.period}</span>
                </span>
              </div>
              
              <Separator />
              
              <div className="space-y-2">
                <h4 className="font-medium text-gray-900">包含功能：</h4>
                {currentPlan?.features.map((feature, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm text-gray-700">{feature}</span>
                  </div>
                ))}
              </div>
              
              <Separator />
              
              <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="h-4 w-4 text-yellow-600" />
                  <span className="text-sm font-medium text-yellow-800">温馨提示</span>
                </div>
                <p className="text-sm text-yellow-700 mt-1">
                  订阅成功后立即生效，支持7天无理由退款
                </p>
              </div>
            </CardContent>
          </Card>

          {/* 支付方式选择 */}
          <Card>
            <CardHeader>
              <CardTitle>选择支付方式</CardTitle>
              <CardDescription>请选择您习惯的支付方式</CardDescription>
            </CardHeader>
            <CardContent>
              {!qrCodeUrl ? (
                <div className="space-y-4">
                  {/* 支付宝 */}
                  <div 
                    className={`p-4 border-2 rounded-lg cursor-pointer transition-all hover:bg-blue-50 ${
                      selectedMethod === 'alipay' 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-200'
                    }`}
                    onClick={() => setSelectedMethod('alipay')}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                        <CreditCard className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">支付宝</h3>
                        <p className="text-sm text-gray-500">使用支付宝账户余额、银行卡支付</p>
                      </div>
                      {selectedMethod === 'alipay' && (
                        <CheckCircle className="h-5 w-5 text-blue-600 ml-auto" />
                      )}
                    </div>
                  </div>

                  {/* 微信支付 */}
                  <div 
                    className={`p-4 border-2 rounded-lg cursor-pointer transition-all hover:bg-green-50 ${
                      selectedMethod === 'wechat' 
                        ? 'border-green-500 bg-green-50' 
                        : 'border-gray-200'
                    }`}
                    onClick={() => setSelectedMethod('wechat')}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center">
                        <Smartphone className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">微信支付</h3>
                        <p className="text-sm text-gray-500">扫码支付，快速安全</p>
                      </div>
                      {selectedMethod === 'wechat' && (
                        <CheckCircle className="h-5 w-5 text-green-600 ml-auto" />
                      )}
                    </div>
                  </div>

                  <Button 
                    onClick={handlePayment}
                    disabled={!selectedMethod || loading}
                    className="w-full py-3 text-lg font-semibold"
                    size="lg"
                  >
                    {loading ? '正在创建订单...' : `立即支付 ¥${currentPlan?.price}`}
                  </Button>
                </div>
              ) : (
                /* 微信支付二维码 */
                <div className="text-center space-y-4">
                  <div className="flex items-center justify-center space-x-2 text-green-600">
                    <QrCode className="h-5 w-5" />
                    <span className="font-medium">微信扫码支付</span>
                  </div>
                  
                  <div className="flex justify-center">
                    <div className="p-4 border-2 border-green-200 rounded-lg bg-white">
                      <div className="w-64 h-64 bg-gray-100 flex items-center justify-center rounded">
                        {/* 这里需要前端生成二维码 */}
                        <div className="text-center">
                          <QrCode className="h-16 w-16 text-gray-400 mx-auto mb-2" />
                          <p className="text-sm text-gray-500">请使用微信扫描二维码</p>
                          <p className="text-xs text-gray-400 mt-1">订单号: {orderId}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <p className="text-sm text-gray-600">
                    请使用微信扫描上方二维码完成支付<br />
                    支付完成后页面将自动跳转
                  </p>
                  
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setQrCodeUrl('')
                      setSelectedMethod(null)
                      setOrderId('')
                    }}
                  >
                    重新选择支付方式
                  </Button>
                </div>
              )}

              {/* 安全提示 */}
              <div className="mt-6 p-3 bg-gray-50 rounded-lg">
                <div className="text-xs text-gray-500 space-y-1">
                  <p>• 支付过程采用SSL加密技术，保障您的资金安全</p>
                  <p>• 支持7天无理由退款，退款将原路返回</p>
                  <p>• 如遇支付问题，请联系客服：3123155744@qq.com</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default function DomesticPaymentPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <DomesticPaymentContent />
    </Suspense>
  )
}