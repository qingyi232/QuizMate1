import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { HelpCircle, Search, MessageCircle, Mail, Book, Zap, Settings, CreditCard, User, ArrowRight, ChevronRight } from 'lucide-react'

const faqCategories = [
  {
    icon: Zap,
    title: '快速开始',
    description: '了解如何快速上手QuizMate',
    color: 'bg-blue-100 text-blue-700',
    faqs: [
      {
        question: '如何使用QuizMate分析题目？',
        answer: '只需上传题目图片或输入文字，我们的AI会自动分析并提供详细解答。'
      },
      {
        question: '支持哪些学科？',
        answer: '支持数学、物理、化学、生物、英语、历史等多个学科。'
      },
      {
        question: '如何提高分析准确率？',
        answer: '确保图片清晰、文字完整，必要时可以添加上下文信息。'
      }
    ]
  },
  {
    icon: User,
    title: '账户管理',
    description: '账户相关问题和设置',
    color: 'bg-green-100 text-green-700',
    faqs: [
      {
        question: '如何注册账户？',
        answer: '点击注册按钮，填写邮箱和密码即可快速注册。也支持Google登录。'
      },
      {
        question: '忘记密码怎么办？',
        answer: '在登录页面点击"忘记密码"，输入邮箱获取重置链接。'
      },
      {
        question: '如何修改个人信息？',
        answer: '进入个人设置页面，可以修改用户名、邮箱等基本信息。'
      }
    ]
  },
  {
    icon: CreditCard,
    title: '订阅与付费',
    description: '订阅计划和付费相关问题',
    color: 'bg-purple-100 text-purple-700',
    faqs: [
      {
        question: '有哪些订阅计划？',
        answer: '提供免费版、Pro版和企业版，满足不同用户需求。'
      },
      {
        question: '如何升级到Pro版？',
        answer: '在定价页面选择Pro计划，支持多种支付方式。'
      },
      {
        question: '可以随时取消订阅吗？',
        answer: '是的，您可以随时在账户设置中取消订阅，不会收取额外费用。'
      }
    ]
  },
  {
    icon: Settings,
    title: '技术支持',
    description: '技术问题和故障排除',
    color: 'bg-orange-100 text-orange-700',
    faqs: [
      {
        question: '为什么图片上传失败？',
        answer: '请检查图片格式（支持JPG、PNG）和大小（不超过10MB）。'
      },
      {
        question: '分析速度太慢怎么办？',
        answer: '可能是网络问题，请检查网络连接或稍后重试。'
      },
      {
        question: '如何联系技术支持？',
        answer: '可以通过邮件shenqingyi16@gmail.com或QQ3123155744@qq.com联系我们。'
      }
    ]
  }
]

const quickActions = [
  {
    icon: MessageCircle,
    title: '在线客服',
    description: '实时聊天支持',
    action: '开始对话',
    href: 'mailto:shenqingyi16@gmail.com'
  },
  {
    icon: Mail,
    title: '邮件支持',
    description: '发送详细问题描述',
    action: '发送邮件',
    href: 'mailto:shenqingyi16@gmail.com'
  },
  {
    icon: Book,
    title: '使用指南',
    description: '详细的使用教程',
    action: '查看指南',
    href: '/guides'
  }
]

export default function HelpPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center max-w-4xl mx-auto mb-16">
          <HelpCircle className="h-20 w-20 text-blue-600 mx-auto mb-6" />
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            帮助中心
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            找不到答案？我们来帮您解决问题
          </p>
          
          {/* Search Box */}
          <div className="max-w-2xl mx-auto mb-12">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <Input
                placeholder="搜索问题或关键词..."
                className="pl-12 pr-4 py-6 text-lg border-2 focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          {quickActions.map((action, index) => {
            const IconComponent = action.icon
            return (
              <Card key={index} className="hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-blue-200">
                <CardHeader className="text-center">
                  <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <IconComponent className="h-8 w-8 text-blue-600" />
                  </div>
                  <CardTitle className="text-xl">{action.title}</CardTitle>
                  <CardDescription>{action.description}</CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                  <Button asChild className="w-full">
                    <Link href={action.href}>
                      {action.action}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* FAQ Categories */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            常见问题
          </h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {faqCategories.map((category, index) => {
              const IconComponent = category.icon
              return (
                <Card key={index} className="h-fit">
                  <CardHeader>
                    <div className="flex items-center">
                      <div className={`p-3 rounded-lg mr-4 ${category.color}`}>
                        <IconComponent className="h-6 w-6" />
                      </div>
                      <div>
                        <CardTitle className="text-xl">{category.title}</CardTitle>
                        <CardDescription>{category.description}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {category.faqs.map((faq, faqIndex) => (
                      <details key={faqIndex} className="group">
                        <summary className="flex items-center justify-between cursor-pointer p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                          <span className="font-medium text-gray-900">{faq.question}</span>
                          <ChevronRight className="h-5 w-5 text-gray-500 transform group-open:rotate-90 transition-transform" />
                        </summary>
                        <div className="mt-3 p-3 text-gray-600 bg-white border-l-4 border-blue-200">
                          {faq.answer}
                        </div>
                      </details>
                    ))}
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>

        {/* Contact Section */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-12 text-white text-center">
          <h2 className="text-3xl font-bold mb-4">
            还有其他问题？
          </h2>
          <p className="text-xl mb-8 text-blue-100">
            我们的支持团队随时为您提供帮助
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
            <Button asChild variant="secondary" size="lg" className="flex-1">
              <Link href="mailto:shenqingyi16@gmail.com">
                <Mail className="mr-2 h-5 w-5" />
                发送邮件
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="flex-1 bg-transparent border-white text-white hover:bg-white hover:text-blue-600">
              <Link href="/contact">
                <MessageCircle className="mr-2 h-5 w-5" />
                联系我们
              </Link>
            </Button>
          </div>
          
          <div className="mt-8 pt-8 border-t border-blue-400 text-blue-100">
            <p>邮箱: shenqingyi16@gmail.com | QQ: 3123155744@qq.com</p>
            <p className="mt-2">工作时间: 周一至周五 9:00-18:00 (UTC+8)</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export const metadata = {
  title: 'Help Center - QuizMate',
  description: 'QuizMate帮助中心 - 常见问题、使用指南、技术支持，为您提供全方位的帮助服务。',
}