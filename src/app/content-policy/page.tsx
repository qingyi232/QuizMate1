import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Shield, AlertTriangle, CheckCircle, Mail, FileText, Users, Lock } from 'lucide-react'

const policyCategories = [
  {
    icon: CheckCircle,
    title: '允许的内容',
    color: 'text-green-600 bg-green-100',
    items: [
      '学术性题目和问题',
      '教育相关的讨论',
      '合法的学习资料',
      '建设性的反馈和建议',
      '符合版权法的引用',
      '个人学习笔记分享'
    ]
  },
  {
    icon: AlertTriangle,
    title: '禁止的内容',
    color: 'text-red-600 bg-red-100',
    items: [
      '考试作弊或学术不诚信',
      '侵犯版权的材料',
      '恶意软件或病毒',
      '垃圾信息或广告',
      '不当或非法内容',
      '骚扰或歧视性内容'
    ]
  },
  {
    icon: Shield,
    title: '内容审核',
    color: 'text-blue-600 bg-blue-100',
    items: [
      'AI自动内容检测',
      '人工审核机制',
      '用户举报系统',
      '定期内容审查',
      '违规内容处理',
      '申诉和复审流程'
    ]
  }
]

const violationConsequences = [
  {
    level: '轻微违规',
    description: '首次违反或轻微不当内容',
    consequences: ['内容删除', '警告通知', '使用指导']
  },
  {
    level: '中度违规',
    description: '重复违规或较严重的不当行为',
    consequences: ['内容删除', '功能限制', '账户暂停（7天）']
  },
  {
    level: '严重违规',
    description: '严重违反政策或恶意行为',
    consequences: ['永久封禁', '法律追责', '平台通报']
  }
]

const reportingProcess = [
  {
    step: 1,
    title: '发现问题',
    description: '用户发现违规内容或行为'
  },
  {
    step: 2,
    title: '提交举报',
    description: '通过举报功能或邮件联系我们'
  },
  {
    step: 3,
    title: '审核处理',
    description: '我们的团队在24小时内进行审核'
  },
  {
    step: 4,
    title: '结果通知',
    description: '处理结果通过邮件或系统通知'
  }
]

export default function ContentPolicyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center max-w-4xl mx-auto mb-16">
          <FileText className="h-20 w-20 text-blue-600 mx-auto mb-6" />
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            内容政策
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            为维护健康的学习环境，我们制定了以下内容使用规范
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <p className="text-blue-800">
              <strong>最后更新：</strong> 2025年1月1日 &nbsp;&nbsp;|&nbsp;&nbsp; 
              <strong>生效日期：</strong> 2025年1月15日
            </p>
          </div>
        </div>

        {/* Policy Overview */}
        <div className="mb-16">
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl text-center">政策概述</CardTitle>
              <CardDescription className="text-center">
                QuizMate致力于为全球学生提供安全、有益的学习环境
              </CardDescription>
            </CardHeader>
            <CardContent className="text-gray-700 leading-relaxed">
              <p className="mb-4">
                我们的内容政策旨在确保平台上的所有内容都符合教育目的，促进积极的学习体验。
                所有用户在使用QuizMate服务时，都需要遵守这些准则。
              </p>
              <p className="mb-4">
                我们使用先进的AI技术和人工审核相结合的方式来监控和管理内容，确保平台的安全性和教育价值。
                如果您发现任何违反政策的内容，请及时向我们举报。
              </p>
              <p>
                违反内容政策可能导致内容删除、账户限制或永久封禁等后果。
                我们鼓励所有用户积极举报不当内容，共同维护良好的学习环境。
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Content Categories */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            内容分类规范
          </h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {policyCategories.map((category, index) => {
              const IconComponent = category.icon
              return (
                <Card key={index} className="border-0 shadow-lg h-full">
                  <CardHeader className="text-center">
                    <div className={`w-16 h-16 rounded-full ${category.color} flex items-center justify-center mx-auto mb-4`}>
                      <IconComponent className="h-8 w-8" />
                    </div>
                    <CardTitle className="text-xl">{category.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      {category.items.map((item, itemIndex) => (
                        <li key={itemIndex} className="flex items-start">
                          <div className="w-2 h-2 bg-gray-400 rounded-full mr-3 mt-2 flex-shrink-0"></div>
                          <span className="text-gray-700">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>

        {/* Academic Integrity */}
        <Card className="mb-16 border-l-4 border-yellow-500 bg-yellow-50">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center text-yellow-800">
              <AlertTriangle className="h-6 w-6 mr-2" />
              学术诚信声明
            </CardTitle>
          </CardHeader>
          <CardContent className="text-yellow-800">
            <p className="mb-4">
              QuizMate是一个学习辅助工具，旨在帮助学生理解和掌握知识。我们强烈反对任何形式的学术不诚信行为。
            </p>
            <div className="bg-yellow-100 p-4 rounded-lg">
              <h4 className="font-bold mb-2">请注意：</h4>
              <ul className="space-y-1">
                <li>• 禁止在考试期间使用本平台</li>
                <li>• 禁止直接复制AI生成的答案作为作业提交</li>
                <li>• 建议将AI分析结果作为学习参考，而非标准答案</li>
                <li>• 鼓励独立思考，理解解题过程</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Violation Consequences */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            违规后果
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {violationConsequences.map((violation, index) => (
              <Card key={index} className="border-0 shadow-lg">
                <CardHeader>
                  <div className="flex items-center mb-2">
                    <div className="w-8 h-8 bg-red-100 text-red-600 rounded-full flex items-center justify-center mr-3 font-bold">
                      {index + 1}
                    </div>
                    <CardTitle className="text-lg">{violation.level}</CardTitle>
                  </div>
                  <CardDescription>{violation.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <h4 className="font-semibold mb-3 text-gray-900">处理措施：</h4>
                  <ul className="space-y-2">
                    {violation.consequences.map((consequence, conseqIndex) => (
                      <li key={conseqIndex} className="flex items-center text-sm">
                        <div className="w-1.5 h-1.5 bg-red-500 rounded-full mr-2"></div>
                        {consequence}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Reporting Process */}
        <Card className="mb-16 border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl text-center">举报流程</CardTitle>
            <CardDescription className="text-center">
              发现违规内容？请按以下步骤进行举报
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {reportingProcess.map((process, index) => (
                <div key={index} className="text-center">
                  <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 font-bold text-lg">
                    {process.step}
                  </div>
                  <h3 className="font-bold text-gray-900 mb-2">{process.title}</h3>
                  <p className="text-sm text-gray-600">{process.description}</p>
                </div>
              ))}
            </div>
            
            <div className="mt-8 text-center">
              <Button asChild size="lg">
                <Link href="mailto:shenqingyi16@gmail.com?subject=内容举报">
                  <Mail className="mr-2 h-5 w-5" />
                  举报违规内容
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* User Rights */}
        <Card className="mb-16 bg-green-50 border-green-200">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center text-green-800">
              <Users className="h-6 w-6 mr-2" />
              用户权利
            </CardTitle>
          </CardHeader>
          <CardContent className="text-green-800">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-bold mb-3">您有权利：</h4>
                <ul className="space-y-2">
                  <li>• 对处理决定提出申诉</li>
                  <li>• 要求说明违规具体原因</li>
                  <li>• 获得公平的复审机会</li>
                  <li>• 删除自己发布的内容</li>
                </ul>
              </div>
              <div>
                <h4 className="font-bold mb-3">申诉渠道：</h4>
                <ul className="space-y-2">
                  <li>• 邮件: shenqingyi16@gmail.com</li>
                  <li>• QQ: 3123155744@qq.com</li>
                  <li>• 申诉表单（系统内）</li>
                  <li>• 响应时间: 3-5个工作日</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Privacy & Data */}
        <Card className="mb-16 bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center text-blue-800">
              <Lock className="h-6 w-6 mr-2" />
              隐私与数据保护
            </CardTitle>
          </CardHeader>
          <CardContent className="text-blue-800">
            <p className="mb-4">
              在执行内容政策的过程中，我们严格保护用户的隐私权：
            </p>
            <ul className="space-y-2">
              <li>• 用户数据加密存储，仅授权人员可访问</li>
              <li>• 内容审核过程匿名化处理</li>
              <li>• 举报人身份严格保密</li>
              <li>• 违规记录仅用于安全目的，不对外披露</li>
              <li>• 符合GDPR、CCPA等隐私法规要求</li>
            </ul>
          </CardContent>
        </Card>

        {/* Policy Updates */}
        <Card className="mb-16 border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl">政策更新</CardTitle>
          </CardHeader>
          <CardContent className="text-gray-700">
            <p className="mb-4">
              我们可能会定期更新本内容政策，以反映服务的变化、法律要求或最佳实践。
              重大变更将通过以下方式通知用户：
            </p>
            <ul className="space-y-2 mb-6">
              <li>• 网站首页公告</li>
              <li>• 邮件通知（注册用户）</li>
              <li>• 系统内消息推送</li>
              <li>• 至少30天的提前通知期</li>
            </ul>
            <div className="bg-gray-100 p-4 rounded-lg">
              <p className="text-sm">
                <strong>建议：</strong> 请定期查看本政策的最新版本。
                继续使用我们的服务即表示您同意更新后的政策条款。
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Contact */}
        <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0 shadow-lg">
          <CardContent className="p-12 text-center">
            <h2 className="text-3xl font-bold mb-4">
              有疑问或建议？
            </h2>
            <p className="text-xl mb-8 text-blue-100">
              我们随时欢迎您的反馈，帮助我们改进内容政策
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" variant="secondary">
                <Link href="mailto:shenqingyi16@gmail.com">
                  发送邮件
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="bg-transparent border-white text-white hover:bg-white hover:text-blue-600">
                <Link href="/contact">
                  联系我们
                </Link>
              </Button>
            </div>
            <p className="mt-6 text-blue-200 text-sm">
              邮箱: shenqingyi16@gmail.com | QQ: 3123155744@qq.com
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export const metadata = {
  title: 'Content Policy - QuizMate',
  description: 'QuizMate内容政策 - 了解平台的内容使用规范、学术诚信要求和违规处理流程。',
}