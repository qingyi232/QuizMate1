'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, Mail, Calendar, CreditCard, ArrowRight } from 'lucide-react'

function SubscriptionSuccessContent() {
  const searchParams = useSearchParams()
  const subscriptionId = searchParams.get('subscriptionId')
  const [subscriptionData, setSubscriptionData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (subscriptionId) {
      fetchSubscriptionDetails()
    } else {
      setLoading(false)
    }
  }, [subscriptionId])

  const fetchSubscriptionDetails = async () => {
    try {
      // 这里可以调用API获取订阅详情
      // const response = await fetch(`/api/paypal/subscription/${subscriptionId}`)
      // const data = await response.json()
      // setSubscriptionData(data)
      
      // 暂时模拟数据
      setSubscriptionData({
        id: subscriptionId,
        status: 'ACTIVE',
        plan_name: 'Pro Plan',
        amount: '$9.99',
        next_billing_time: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      })
    } catch (error) {
      console.error('获取订阅详情失败:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">正在加载订阅详情...</p>
        </div>
      </div>
    )
  }

  if (!subscriptionId) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-md mx-auto">
          <CardContent className="text-center pt-8">
            <div className="text-red-500 mb-4">
              <CreditCard className="w-16 h-16 mx-auto" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              缺少订阅信息
            </h2>
            <p className="text-gray-600 mb-6">
              未找到有效的订阅ID
            </p>
            <Button asChild>
              <Link href="/paypal-subscription">
                返回订阅页面
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* 成功消息 */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center justify-center w-24 h-24 bg-green-100 rounded-full mb-6">
          <CheckCircle className="w-12 h-12 text-green-600" />
        </div>
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          订阅成功！
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          恭喜您成功订阅了QuizMate服务！您现在可以享受所有高级功能。
        </p>
      </div>

      {/* 订阅详情卡片 */}
      <Card className="max-w-2xl mx-auto mb-8">
        <CardHeader>
          <CardTitle className="flex items-center">
            <CreditCard className="w-6 h-6 mr-2 text-blue-600" />
            订阅详情
          </CardTitle>
          <CardDescription>
            您的订阅信息和账单详情
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* 订阅ID */}
          <div className="flex justify-between items-center py-3 border-b border-gray-100">
            <span className="text-gray-600">订阅ID</span>
            <span className="font-mono text-sm bg-gray-100 px-3 py-1 rounded">
              {subscriptionId}
            </span>
          </div>

          {/* 订阅状态 */}
          <div className="flex justify-between items-center py-3 border-b border-gray-100">
            <span className="text-gray-600">状态</span>
            <Badge className="bg-green-100 text-green-700 hover:bg-green-200">
              {subscriptionData?.status === 'ACTIVE' ? '已激活' : subscriptionData?.status}
            </Badge>
          </div>

          {/* 计划名称 */}
          <div className="flex justify-between items-center py-3 border-b border-gray-100">
            <span className="text-gray-600">订阅计划</span>
            <span className="font-semibold">{subscriptionData?.plan_name}</span>
          </div>

          {/* 计费金额 */}
          <div className="flex justify-between items-center py-3 border-b border-gray-100">
            <span className="text-gray-600">月度费用</span>
            <span className="text-2xl font-bold text-green-600">
              {subscriptionData?.amount}
            </span>
          </div>

          {/* 下次计费时间 */}
          {subscriptionData?.next_billing_time && (
            <div className="flex justify-between items-center py-3">
              <span className="text-gray-600 flex items-center">
                <Calendar className="w-4 h-4 mr-2" />
                下次计费时间
              </span>
              <span className="font-semibold">
                {new Date(subscriptionData.next_billing_time).toLocaleDateString('zh-CN')}
              </span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 下一步操作 */}
      <Card className="max-w-2xl mx-auto mb-8">
        <CardHeader>
          <CardTitle className="text-green-600">接下来您可以...</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button asChild className="h-auto p-6 flex flex-col items-start">
              <Link href="/quiz">
                <div className="flex items-center w-full mb-2">
                  <ArrowRight className="w-5 h-5 mr-2" />
                  开始使用
                </div>
                <span className="text-sm opacity-80">
                  立即体验高级AI分析功能
                </span>
              </Link>
            </Button>

            <Button asChild variant="outline" className="h-auto p-6 flex flex-col items-start">
              <Link href="/dashboard">
                <div className="flex items-center w-full mb-2">
                  <CreditCard className="w-5 h-5 mr-2" />
                  查看仪表板
                </div>
                <span className="text-sm opacity-80">
                  管理您的账户和订阅
                </span>
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 重要提醒 */}
      <Card className="max-w-2xl mx-auto bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <div className="flex items-start">
            <Mail className="w-6 h-6 text-blue-600 mr-3 mt-1 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-blue-900 mb-2">
                重要提醒
              </h3>
              <ul className="text-blue-800 text-sm space-y-2">
                <li>• 确认邮件已发送至您的PayPal邮箱</li>
                <li>• 您可以随时在PayPal账户中管理订阅</li>
                <li>• 如需帮助，请联系我们的客服团队</li>
                <li>• 订阅将在每月同一天自动续费</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 客服联系信息 */}
      <div className="text-center mt-12">
        <p className="text-gray-600 mb-4">
          如有任何问题或需要帮助，请联系我们：
        </p>
        <div className="space-x-4">
          <Button asChild variant="outline">
            <Link href="mailto:shenqingyi16@gmail.com">
              <Mail className="w-4 h-4 mr-2" />
              发送邮件
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/terms">
              服务条款
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}

export default function SubscriptionSuccessPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SubscriptionSuccessContent />
    </Suspense>
  )
}