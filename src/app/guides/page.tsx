import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Book, Clock, User, ArrowRight, BookOpen, Calculator, Flask, Dna, Globe, History, Code, FileText } from 'lucide-react'

const studyGuides = [
  {
    icon: Calculator,
    title: '数学学习指南',
    description: '从基础代数到高等微积分，系统化数学学习方法',
    level: '初级-高级',
    duration: '45分钟阅读',
    topics: ['代数基础', '几何定理', '微积分入门', '概率统计'],
    color: 'bg-blue-100 text-blue-700 border-blue-200'
  },
  {
    icon: Flask,
    title: '化学学习攻略',
    description: '掌握化学基本概念，理解分子结构和化学反应',
    level: '中级',
    duration: '35分钟阅读',
    topics: ['原子结构', '化学键', '化学方程式', '有机化学'],
    color: 'bg-green-100 text-green-700 border-green-200'
  },
  {
    icon: Dna,
    title: '生物学习方法',
    description: '生命科学的系统学习，从细胞到生态系统',
    level: '初级-中级',
    duration: '40分钟阅读',
    topics: ['细胞生物学', '遗传学', '生态学', '进化论'],
    color: 'bg-purple-100 text-purple-700 border-purple-200'
  },
  {
    icon: Globe,
    title: '物理学习指导',
    description: '理解自然界的基本规律，掌握物理思维方法',
    level: '中级-高级',
    duration: '50分钟阅读',
    topics: ['力学', '电磁学', '光学', '量子物理'],
    color: 'bg-orange-100 text-orange-700 border-orange-200'
  },
  {
    icon: History,
    title: '历史学习技巧',
    description: '时间线整理、史料分析、历史事件关联记忆法',
    level: '初级',
    duration: '30分钟阅读',
    topics: ['时间线法', '史料分析', '因果关系', '记忆技巧'],
    color: 'bg-yellow-100 text-yellow-700 border-yellow-200'
  },
  {
    icon: BookOpen,
    title: '语言学习方法',
    description: '提高阅读理解、写作表达和语言运用能力',
    level: '初级-高级',
    duration: '25分钟阅读',
    topics: ['阅读技巧', '写作方法', '语法掌握', '词汇积累'],
    color: 'bg-red-100 text-red-700 border-red-200'
  },
  {
    icon: Code,
    title: '编程学习路径',
    description: '从编程思维到实际项目，系统化编程学习',
    level: '初级-高级',
    duration: '60分钟阅读',
    topics: ['编程基础', '算法思维', '数据结构', '项目实战'],
    color: 'bg-indigo-100 text-indigo-700 border-indigo-200'
  },
  {
    icon: FileText,
    title: '考试应试技巧',
    description: '高效复习方法、考试心理调节、答题策略',
    level: '通用',
    duration: '20分钟阅读',
    topics: ['复习计划', '答题技巧', '心理调节', '时间管理'],
    color: 'bg-gray-100 text-gray-700 border-gray-200'
  }
]

const learningTips = [
  {
    title: '制定学习计划',
    description: '设定明确的学习目标，制定可执行的学习计划，定期回顾和调整。'
  },
  {
    title: '主动学习法',
    description: '通过提问、总结、教授他人等方式，变被动接受为主动思考。'
  },
  {
    title: '分散学习',
    description: '将学习时间分散到多个时段，比集中突击学习效果更好。'
  },
  {
    title: '多感官参与',
    description: '结合视觉、听觉、触觉等多种感官，提高记忆效果。'
  },
  {
    title: '及时复习',
    description: '遵循遗忘曲线规律，在遗忘前及时复习巩固知识。'
  },
  {
    title: '错误分析',
    description: '认真分析错题原因，建立错题集，避免重复犯错。'
  }
]

export default function StudyGuidesPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center max-w-4xl mx-auto mb-16">
          <Book className="h-20 w-20 text-blue-600 mx-auto mb-6" />
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            学习指南
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            系统化的学习方法和技巧，帮助您更高效地掌握知识
          </p>
          <Badge className="bg-blue-100 text-blue-700 text-lg px-6 py-2">
            持续更新中...
          </Badge>
        </div>

        {/* Study Guides Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {studyGuides.map((guide, index) => {
            const IconComponent = guide.icon
            return (
              <Card key={index} className="h-full hover:shadow-lg transition-all duration-200 cursor-pointer group">
                <CardHeader>
                  <div className="flex items-center justify-between mb-3">
                    <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg">
                      <IconComponent className="h-6 w-6 text-white" />
                    </div>
                    <Badge variant="outline" className={guide.color}>
                      {guide.level}
                    </Badge>
                  </div>
                  <CardTitle className="text-xl group-hover:text-blue-600 transition-colors">
                    {guide.title}
                  </CardTitle>
                  <CardDescription className="text-gray-600">
                    {guide.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-1" />
                      {guide.duration}
                    </div>
                    <div className="flex items-center">
                      <User className="h-4 w-4 mr-1" />
                      {guide.level}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">主要内容:</h4>
                    <div className="flex flex-wrap gap-2">
                      {guide.topics.map((topic, topicIndex) => (
                        <Badge key={topicIndex} variant="secondary" className="text-xs">
                          {topic}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <Button className="w-full mt-4 group-hover:bg-blue-600 transition-colors">
                    开始阅读
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Learning Tips Section */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              通用学习技巧
            </h2>
            <p className="text-xl text-gray-600">
              适用于所有学科的高效学习方法
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {learningTips.map((tip, index) => (
              <Card key={index} className="p-6 border-l-4 border-blue-500 bg-blue-50/30">
                <h3 className="font-bold text-gray-900 mb-3 text-lg">
                  {index + 1}. {tip.title}
                </h3>
                <p className="text-gray-600">
                  {tip.description}
                </p>
              </Card>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-12 text-white text-center">
          <BookOpen className="h-16 w-16 mx-auto mb-6" />
          <h2 className="text-3xl font-bold mb-4">
            开始您的高效学习之旅
          </h2>
          <p className="text-xl mb-8 text-blue-100 max-w-2xl mx-auto">
            结合这些学习方法和QuizMate的AI分析功能，让学习事半功倍
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" variant="secondary" className="text-lg px-8 py-6">
              <Link href="/quiz">
                开始练习
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="text-lg px-8 py-6 bg-transparent border-white text-white hover:bg-white hover:text-blue-600">
              <Link href="/questions">
                浏览题库
              </Link>
            </Button>
          </div>
        </div>

        {/* Footer Note */}
        <div className="mt-12 text-center text-gray-500">
          <p>本指南基于教育心理学和认知科学研究成果编写，持续更新优化中。</p>
          <p className="mt-2">如有疑问或建议，请联系我们：shenqingyi16@gmail.com</p>
        </div>
      </div>
    </div>
  )
}

export const metadata = {
  title: 'Study Guides - QuizMate',
  description: 'QuizMate学习指南 - 提供系统化的学习方法和技巧，涵盖数学、物理、化学、生物等多个学科。',
}