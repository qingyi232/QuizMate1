'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useToast } from '@/components/ui/use-toast'
import { Mail, MessageCircle, Clock, Globe, Send, Loader2, CheckCircle } from 'lucide-react'

const contactMethods = [
  {
    icon: Mail,
    title: '邮件支持',
    description: '发送详细问题描述，我们会在24小时内回复',
    contact: 'shenqingyi16@gmail.com',
    action: 'mailto:shenqingyi16@gmail.com',
    actionText: '发送邮件',
    available: '全天候'
  },
  {
    icon: MessageCircle,
    title: 'QQ联系',
    description: '快速实时沟通，获得即时帮助',
    contact: '3123155744@qq.com',
    action: 'mailto:3123155744@qq.com',
    actionText: '联系QQ',
    available: '工作时间'
  }
]

const supportTopics = [
  {
    category: '技术支持',
    description: '产品使用、功能问题、技术故障',
    responseTime: '4-8小时'
  },
  {
    category: '账户问题',
    description: '注册登录、账户设置、密码重置',
    responseTime: '2-4小时'
  },
  {
    category: '订阅计费',
    description: '订阅升级、付费问题、发票申请',
    responseTime: '1-2小时'
  },
  {
    category: '产品反馈',
    description: '功能建议、用户体验、产品改进',
    responseTime: '24-48小时'
  },
  {
    category: '商务合作',
    description: '企业合作、API接入、定制开发',
    responseTime: '1-3工作日'
  },
  {
    category: '其他问题',
    description: '其他未分类的问题和咨询',
    responseTime: '12-24小时'
  }
]

export default function ContactPage() {
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    category: '',
    subject: '',
    message: ''
  })

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // 验证表单
    if (!formData.name || !formData.email || !formData.category || !formData.subject || !formData.message) {
      toast({
        title: '请填写完整信息',
        description: '所有带*的字段都是必填项',
        variant: 'destructive'
      })
      return
    }

    setIsSubmitting(true)
    
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (response.ok) {
        setIsSubmitted(true)
        toast({
          title: '发送成功！',
          description: data.message,
        })
        // 重置表单
        setFormData({
          name: '',
          email: '',
          category: '',
          subject: '',
          message: ''
        })
      } else {
        throw new Error(data.error || '发送失败')
      }
    } catch (error: any) {
      toast({
        title: '发送失败',
        description: error.message || '请稍后重试或直接发送邮件至 shenqingyi16@gmail.com',
        variant: 'destructive'
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center max-w-4xl mx-auto mb-16">
          <MessageCircle className="h-20 w-20 text-blue-600 mx-auto mb-6" />
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            联系我们
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            有任何问题或建议？我们很乐意为您提供帮助
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contact Form */}
          <div className="lg:col-span-2">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-2xl">发送消息</CardTitle>
                <CardDescription>
                  填写下面的表单，我们会尽快回复您
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">
                        姓名 *
                      </label>
                      <Input 
                        placeholder="请输入您的姓名" 
                        value={formData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        required 
                        disabled={isSubmitting}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">
                        邮箱 *
                      </label>
                      <Input 
                        type="email" 
                        placeholder="your@email.com" 
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        required 
                        disabled={isSubmitting}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">
                      问题类型 *
                    </label>
                    <Select 
                      value={formData.category}
                      onValueChange={(value) => handleInputChange('category', value)}
                      required
                      disabled={isSubmitting}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="选择问题类型" />
                      </SelectTrigger>
                      <SelectContent>
                        {supportTopics.map((topic, index) => (
                          <SelectItem key={index} value={topic.category}>
                            {topic.category} - {topic.description}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">
                      主题 *
                    </label>
                    <Input 
                      placeholder="简要描述您的问题" 
                      value={formData.subject}
                      onChange={(e) => handleInputChange('subject', e.target.value)}
                      required 
                      disabled={isSubmitting}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">
                      详细描述 *
                    </label>
                    <Textarea 
                      placeholder="请详细描述您的问题或建议..."
                      rows={6}
                      value={formData.message}
                      onChange={(e) => handleInputChange('message', e.target.value)}
                      required
                      disabled={isSubmitting}
                    />
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full" 
                    size="lg" 
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    ) : isSubmitted ? (
                      <CheckCircle className="mr-2 h-5 w-5" />
                    ) : (
                      <Send className="mr-2 h-5 w-5" />
                    )}
                    {isSubmitting ? '发送中...' : isSubmitted ? '发送成功' : '发送消息'}
                  </Button>
                </form>

                <p className="text-sm text-gray-500 text-center">
                  我们承诺保护您的隐私信息，不会将其用于营销目的
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Contact Methods & Info */}
          <div className="space-y-6">
            {/* Contact Methods */}
            <div className="space-y-4">
              {contactMethods.map((method, index) => {
                const IconComponent = method.icon
                return (
                  <Card key={index} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start space-x-4">
                        <div className="p-3 bg-blue-100 rounded-lg">
                          <IconComponent className="h-6 w-6 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 mb-1">
                            {method.title}
                          </h3>
                          <p className="text-sm text-gray-600 mb-2">
                            {method.description}
                          </p>
                          <p className="text-sm font-medium text-blue-600 mb-3">
                            {method.contact}
                          </p>
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-500">
                              {method.available}
                            </span>
                            <Button asChild size="sm" variant="outline">
                              <Link href={method.action}>
                                {method.actionText}
                              </Link>
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>

            {/* Response Times */}
            <Card className="bg-blue-50 border-blue-200">
              <CardHeader>
                <div className="flex items-center">
                  <Clock className="h-5 w-5 text-blue-600 mr-2" />
                  <CardTitle className="text-lg">响应时间</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {supportTopics.map((topic, index) => (
                  <div key={index} className="flex justify-between items-center">
                    <span className="text-sm text-gray-700">{topic.category}</span>
                    <span className="text-sm font-medium text-blue-600">
                      {topic.responseTime}
                    </span>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Office Hours */}
            <Card className="bg-green-50 border-green-200">
              <CardContent className="p-6">
                <div className="flex items-center mb-3">
                  <Globe className="h-5 w-5 text-green-600 mr-2" />
                  <h3 className="font-semibold text-gray-900">工作时间</h3>
                </div>
                <div className="space-y-2 text-sm text-gray-700">
                  <p>• 周一至周五：9:00 - 18:00 (UTC+8)</p>
                  <p>• 周末：10:00 - 16:00 (UTC+8)</p>
                  <p>• 节假日：邮件支持</p>
                </div>
                <div className="mt-4 pt-4 border-t border-green-200">
                  <p className="text-xs text-green-600">
                    邮件支持24/7全天候可用
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* FAQ Link */}
        <div className="mt-16 text-center">
          <div className="bg-gray-50 rounded-2xl p-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              在联系我们之前
            </h2>
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
              您可以先查看我们的帮助中心，可能已经有您需要的答案
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" variant="outline">
                <Link href="/help">
                  查看帮助中心
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/guides">
                  阅读使用指南
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Metadata moved to layout.tsx since this is a client component