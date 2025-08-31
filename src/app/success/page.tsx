'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  CheckCircle, 
  Star, 
  Gift,
  ArrowRight,
  Download,
  Zap
} from 'lucide-react'

function SuccessContent() {
  const searchParams = useSearchParams()
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [sessionData, setSessionData] = useState<any>(null)

  useEffect(() => {
    const id = searchParams.get('session_id')
    setSessionId(id)
    
    if (id) {
      // 验证支付会话
      verifySession(id)
    } else {
      setLoading(false)
    }
  }, [searchParams])

  const verifySession = async (sessionId: string) => {
    try {
      const response = await fetch(`/api/verify-session?session_id=${sessionId}`)
      const data = await response.json()
      
      if (response.ok) {
        setSessionData(data)
        // 这里可以调用API更新用户的订阅状态
        await updateUserSubscription(data)
      }
    } catch (error) {
      console.error('验证支付会话失败:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateUserSubscription = async (sessionData: any) => {
    try {
      await fetch('/api/update-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId: sessionData.id,
          customerId: sessionData.customer,
          subscriptionId: sessionData.subscription,
          plan: sessionData.metadata?.plan,
          email: sessionData.customer_email,
        }),
      })
    } catch (error) {
      console.error('更新用户订阅状态失败:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">验证支付状态中...</p>
        </div>
      </div>
    )
  }

  if (!sessionId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center">
            <h3 className="text-lg font-semibold mb-2">支付信息缺失</h3>
            <p className="text-gray-600 mb-4">未找到有效的支付会话</p>
            <Button onClick={() => window.location.href = '/pricing'}>
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
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="max-w-2xl mx-auto text-center"
        >
          {/* 成功图标 */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ 
              type: "spring",
              stiffness: 260,
              damping: 20,
              delay: 0.2 
            }}
            className="mb-8"
          >
            <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="w-12 h-12 text-green-600" />
            </div>
          </motion.div>

          {/* 主标题 */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="text-3xl md:text-4xl font-bold mb-4"
          >
            <span className="bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
              🎉 支付成功！欢迎加入 Pro 会员！
            </span>
          </motion.h1>

          {/* 描述 */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            className="text-lg text-gray-600 mb-8"
          >
            恭喜您成功升级到 Pro 版本！现在您可以享受所有高级功能，开启高效学习之旅。
          </motion.p>

          {/* 功能卡片 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.6 }}
            className="grid md:grid-cols-2 gap-6 mb-8"
          >
            <Card className="p-6 text-left">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Zap className="w-5 h-5 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold ml-3">立即生效</h3>
              </div>
              <p className="text-gray-600">
                您的Pro权限已激活，可以立即使用无限次AI解析和完整题库功能。
              </p>
            </Card>

            <Card className="p-6 text-left">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <Gift className="w-5 h-5 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold ml-3">限时福利</h3>
              </div>
              <p className="text-gray-600">
                作为新用户，您将获得额外的学习资源和专属客服支持。
              </p>
            </Card>
          </motion.div>

          {/* 行动按钮 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.0, duration: 0.6 }}
            className="space-y-4"
          >
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                className="px-8 py-4 text-lg font-semibold"
                onClick={() => window.location.href = '/questions'}
              >
                开始练习题库
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              
              <Button 
                variant="outline" 
                size="lg"
                className="px-8 py-4 text-lg font-semibold"
                onClick={() => window.location.href = '/quiz'}
              >
                体验AI解析
                <Star className="w-5 h-5 ml-2" />
              </Button>
            </div>

            <Button 
              variant="ghost" 
              className="text-sm"
              onClick={() => window.location.href = '/dashboard'}
            >
              <Download className="w-4 h-4 mr-2" />
              查看订阅详情和发票
            </Button>
          </motion.div>

          {/* 帮助信息 */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2, duration: 0.6 }}
            className="mt-12 p-6 bg-white rounded-xl shadow-sm"
          >
            <h4 className="font-semibold mb-3">需要帮助？</h4>
            <div className="grid md:grid-cols-3 gap-4 text-sm">
              <div>
                <p className="font-medium text-gray-700">📧 订阅确认邮件</p>
                <p className="text-gray-500">已发送到您的邮箱</p>
              </div>
              <div>
                <p className="font-medium text-gray-700">❓ 使用指南</p>
                <p className="text-gray-500">
                  <a href="/help" className="text-blue-600 hover:underline">
                    查看快速入门教程
                  </a>
                </p>
              </div>
              <div>
                <p className="font-medium text-gray-700">💬 客服支持</p>
                <p className="text-gray-500">
                  <a href="mailto:3123155744@qq.com" className="text-blue-600 hover:underline">
                    3123155744@qq.com
                  </a>
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}

export default function SuccessPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SuccessContent />
    </Suspense>
  )
}