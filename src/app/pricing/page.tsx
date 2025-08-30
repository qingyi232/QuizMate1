'use client'

import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Check, Zap, Star, Users, Globe, Sparkles } from 'lucide-react'

export default function PricingPage() {
  const plans = [
    {
      name: '免费版',
      price: '$0',
      period: '/月',
      description: '适合初学者和轻度使用',
      features: [
        '每日 3 次 AI 解析',
        '基础题库访问（50题/日）',
        '基础OCR图片识别',
        '错题本功能',
        '社区支持'
      ],
      buttonText: '立即免费使用',
      buttonVariant: 'outline' as const,
      buttonAction: '/auth/register',
      popular: false
    },
    {
      name: 'Pro 高级版',
      price: '$4.99',
      period: '/月',
      description: '适合认真学习的学生',
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
      buttonText: '升级到 Pro',
      buttonVariant: 'default' as const,
      buttonAction: '/payment/domestic?plan=pro_monthly',
      popular: true
    },
    {
      name: '企业版',
      price: '联系我们',
      period: '',
      description: '适合学校和培训机构',
      features: [
        '包含所有Pro功能',
        '批量用户管理',
        '自定义题库导入',
        '高级统计分析',
        'API 接入权限',
        '专属客户经理',
        '白标定制服务'
      ],
      buttonText: '联系销售',
      buttonVariant: 'outline' as const,
      buttonAction: 'mailto:shenqingyi16@gmail.com?subject=企业版咨询&body=您好，我想了解QuizMate企业版的详细信息。',
      popular: false
    }
  ]

  const features = [
    {
      icon: <Zap className="h-6 w-6" />,
      title: 'SmartRouter AI',
      description: '智能路由系统，自动选择最适合的AI模型解析问题'
    },
    {
      icon: <Globe className="h-6 w-6" />,
      title: '1300+国际题库',
      description: '涵盖7大学科的国际化题目，支持多语言和难度分级'
    },
    {
      icon: <Users className="h-6 w-6" />,
      title: '专业练习模式',
      description: '完整的学习流程：阅读→思考→答题→查看解析→巩固'
    },
    {
      icon: <Sparkles className="h-6 w-6" />,
      title: '智能OCR识别',
      description: '支持图片识别，公式解析，让学习更便捷高效'
    }
  ]

  const faqs = [
    {
      question: '免费版本有什么限制吗？',
      answer: '免费版每天可以使用 3 次 AI 解析功能，访问50道练习题，包含基础的OCR识别和错题本功能。对于初学者来说已经足够开始学习。'
    },
    {
      question: 'SmartRouter AI 多模型是什么？',
      answer: 'SmartRouter会根据您的问题类型自动选择最适合的AI模型进行解析，包括数学专用模型、语言模型等，确保最准确的答案。'
    },
    {
      question: '题库包含哪些内容？',
      answer: 'Pro版本包含1300+道国际化题目，覆盖数学、物理、化学、生物、英语、计算机、历史等7大学科，支持多种语言和难度级别。'
    },
    {
      question: '可以随时取消订阅吗？',
      answer: '当然可以！您可以随时在设置页面取消订阅，取消后您的 Pro 功能将在当前计费周期结束后停止。'
    },
    {
      question: '企业版有什么特殊功能？',
      answer: '企业版提供批量用户管理、自定义题库导入、高级统计分析、API接入等功能，适合学校和培训机构使用。'
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="container mx-auto px-4 pt-24 pb-16 text-center"
      >
        <h1 className="text-4xl md:text-6xl font-bold mb-6">
          <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-green-600 bg-clip-text text-transparent">
            选择适合你的方案
          </span>
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          从免费开始，随时升级到 Pro 版本
        </p>
      </motion.div>

      {/* Pricing Cards */}
      <motion.div 
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="container mx-auto px-4 pb-16"
      >
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="relative"
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <div className="bg-gradient-to-r from-orange-400 to-pink-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                    最受欢迎
                  </div>
                </div>
              )}
              <Card className={`h-full ${plan.popular ? 'ring-2 ring-blue-500 shadow-2xl scale-105' : 'shadow-lg'} transition-all duration-300 hover:shadow-xl`}>
                <CardHeader className="text-center pb-8">
                  <CardTitle className="text-2xl font-bold mb-2">{plan.name}</CardTitle>
                  <div className="flex items-center justify-center mb-4">
                    <span className="text-4xl font-bold text-blue-600">{plan.price}</span>
                    <span className="text-gray-500 ml-1">{plan.period}</span>
                  </div>
                  <p className="text-gray-600">{plan.description}</p>
                </CardHeader>
                <CardContent className="space-y-6">
                  <ul className="space-y-3">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center">
                        <Check className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                        <span className="text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button 
                    variant={plan.buttonVariant}
                    className="w-full py-6 text-lg font-semibold"
                    onClick={() => window.location.href = plan.buttonAction}
                  >
                    {plan.buttonText}
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Features Section */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.4 }}
        className="bg-white py-16"
      >
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              <span className="bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
                为什么选择 QuizMate？
              </span>
            </h2>
            <p className="text-xl text-gray-600">
              我们的 AI 技术让学习变得更聪明、更高效
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="text-center"
              >
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-green-500 rounded-2xl flex items-center justify-center text-white mb-4 mx-auto">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* FAQ Section */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.6 }}
        className="py-16 bg-gray-50"
      >
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              <span className="bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                常见问题
              </span>
            </h2>
            <p className="text-xl text-gray-600">
              快速了解 QuizMate 的功能特性
            </p>
          </div>
          <div className="max-w-3xl mx-auto space-y-6">
            {faqs.map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Card className="shadow-sm hover:shadow-md transition-shadow duration-300">
                  <CardHeader>
                    <CardTitle className="text-lg text-left">{faq.question}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600">{faq.answer}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* CTA Section */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.8 }}
        className="bg-gradient-to-r from-blue-600 to-green-600 py-16"
      >
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            准备好提升你的学习效率了吗？
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            加入数万名学生，开始你的 AI 学习之旅
          </p>
          <Button 
            size="lg" 
            variant="secondary"
            className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-4 text-lg font-semibold"
          >
            立即免费开始 →
          </Button>
        </div>
      </motion.div>
    </div>
  )
}