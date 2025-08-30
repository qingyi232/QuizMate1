import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, Zap, Brain, Target, BarChart3, Users, Globe, Lock, Smartphone, Clock, Star, ArrowRight } from 'lucide-react'

const features = [
  {
    icon: Brain,
    title: 'AI智能分析',
    description: '基于最先进的AI模型，自动分析题目并生成详细解答',
    benefits: [
      '支持多种学科',
      '秒级响应速度',
      '准确率高达95%',
      '多语言支持'
    ],
    category: 'core'
  },
  {
    icon: Target,
    title: '个性化学习',
    description: '根据学习进度和薄弱环节，提供定制化学习建议',
    benefits: [
      '智能推荐题目',
      '学习路径规划',
      '个性化复习',
      '进度跟踪'
    ],
    category: 'core'
  },
  {
    icon: BarChart3,
    title: '学习统计',
    description: '详细的学习数据分析，帮助你了解学习进度和效果',
    benefits: [
      '学习时长统计',
      '正确率分析',
      '知识点掌握度',
      '趋势分析图表'
    ],
    category: 'analytics'
  },
  {
    icon: Zap,
    title: '快速解答',
    description: '上传题目图片，即可获得即时详细解答和分析',
    benefits: [
      'OCR文字识别',
      '图片题目解析',
      '公式识别',
      '手写字体支持'
    ],
    category: 'core'
  },
  {
    icon: Users,
    title: '题库共享',
    description: '丰富的题库资源，涵盖各个学科和难度等级',
    benefits: [
      '海量题目资源',
      '分类详细完整',
      '持续更新',
      '质量保证'
    ],
    category: 'resources'
  },
  {
    icon: Globe,
    title: '多语言支持',
    description: '支持多种语言，满足全球用户的学习需求',
    benefits: [
      '中英文双语',
      '多国语言界面',
      '本地化内容',
      '文化适配'
    ],
    category: 'accessibility'
  },
  {
    icon: Lock,
    title: '数据安全',
    description: '采用银行级加密，保护您的学习数据和隐私安全',
    benefits: [
      'SSL加密传输',
      '数据本地化',
      '隐私保护',
      '安全认证'
    ],
    category: 'security'
  },
  {
    icon: Smartphone,
    title: '多平台支持',
    description: '支持手机、平板、电脑等多种设备，随时随地学习',
    benefits: [
      '响应式设计',
      '跨平台同步',
      '离线功能',
      '云端备份'
    ],
    category: 'accessibility'
  },
  {
    icon: Clock,
    title: '24/7可用',
    description: '全天候服务，随时为您的学习提供支持',
    benefits: [
      '无时间限制',
      '快速响应',
      '稳定服务',
      '全球部署'
    ],
    category: 'service'
  }
]

const categoryColors = {
  core: 'bg-blue-100 text-blue-700 border-blue-200',
  analytics: 'bg-green-100 text-green-700 border-green-200',
  resources: 'bg-purple-100 text-purple-700 border-purple-200',
  accessibility: 'bg-orange-100 text-orange-700 border-orange-200',
  security: 'bg-red-100 text-red-700 border-red-200',
  service: 'bg-gray-100 text-gray-700 border-gray-200'
}

const categoryNames = {
  core: '核心功能',
  analytics: '数据分析',
  resources: '资源服务',
  accessibility: '便捷性',
  security: '安全性',
  service: '服务质量'
}

export default function FeaturesPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center max-w-4xl mx-auto mb-16">
          <Badge className="mb-4 bg-blue-100 text-blue-700 hover:bg-blue-200">
            功能特性
          </Badge>
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            强大功能，让学习更
            <span className="text-blue-600"> 高效</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 leading-relaxed">
            QuizMate集成了最先进的AI技术和丰富的学习资源，为您提供全方位的智能学习体验
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="text-lg px-8 py-6">
              <Link href="/quiz">
                立即体验
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="text-lg px-8 py-6">
              <Link href="/pricing">
                查看定价
              </Link>
            </Button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {features.map((feature, index) => {
            const IconComponent = feature.icon
            return (
              <Card key={index} className="h-full transition-all duration-200 hover:shadow-lg border-0 shadow-md">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg">
                      <IconComponent className="h-6 w-6 text-white" />
                    </div>
                    <Badge 
                      variant="outline" 
                      className={categoryColors[feature.category as keyof typeof categoryColors]}
                    >
                      {categoryNames[feature.category as keyof typeof categoryNames]}
                    </Badge>
                  </div>
                  <CardTitle className="text-xl text-gray-900">
                    {feature.title}
                  </CardTitle>
                  <CardDescription className="text-gray-600">
                    {feature.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {feature.benefits.map((benefit, idx) => (
                      <li key={idx} className="flex items-center text-sm text-gray-700">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                        {benefit}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Statistics Section */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-12 text-white text-center mb-16">
          <h2 className="text-3xl font-bold mb-8">用数据说话</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="text-4xl font-bold mb-2">10,000+</div>
              <div className="text-blue-100">活跃用户</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">1M+</div>
              <div className="text-blue-100">题目解析</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">95%</div>
              <div className="text-blue-100">准确率</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">24/7</div>
              <div className="text-blue-100">在线服务</div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center bg-gray-50 rounded-2xl p-12">
          <Star className="h-16 w-16 text-yellow-500 mx-auto mb-6" />
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            准备好开始您的智能学习之旅了吗？
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            加入我们的学习社区，体验AI驱动的个性化学习
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="text-lg px-8 py-6">
              <Link href="/auth/register">
                免费注册
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="text-lg px-8 py-6">
              <Link href="/contact">
                联系我们
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export const metadata = {
  title: 'Features - QuizMate',
  description: '了解QuizMate的强大功能特性：AI智能分析、个性化学习、学习统计等，让学习更高效。',
}