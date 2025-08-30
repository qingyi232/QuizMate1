import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Calendar, User, Clock, Search, ArrowRight, TrendingUp, Lightbulb, BookOpen, Target } from 'lucide-react'

const featuredPost = {
  id: 1,
  title: 'AI在教育领域的革命性应用：QuizMate如何改变学习方式',
  description: '探索人工智能技术如何重塑传统教育模式，提供个性化学习体验，以及QuizMate在这一变革中的独特价值。',
  author: 'QuizMate团队',
  date: '2025年1月15日',
  readTime: '8分钟阅读',
  category: 'AI技术',
  image: '/blog/ai-education.jpg',
  tags: ['AI', '教育科技', '个性化学习']
}

const blogPosts = [
  {
    id: 2,
    title: '如何有效利用错题本提高学习效率',
    description: '科学的错题分析方法和复习策略，帮助学生从错误中快速成长。',
    author: '学习专家',
    date: '2025年1月12日',
    readTime: '5分钟阅读',
    category: '学习方法',
    tags: ['错题分析', '学习效率', '复习策略']
  },
  {
    id: 3,
    title: '数学学习中的常见误区及解决方案',
    description: '识别数学学习中的典型错误思维，提供针对性的改进建议。',
    author: '数学导师',
    date: '2025年1月10日',
    readTime: '6分钟阅读',
    category: '学科指导',
    tags: ['数学学习', '思维训练', '解题技巧']
  },
  {
    id: 4,
    title: '科技如何改变现代教育：趋势与展望',
    description: '分析教育科技的发展趋势，展望未来学习模式的变化。',
    author: '教育研究员',
    date: '2025年1月8日',
    readTime: '7分钟阅读',
    category: '教育科技',
    tags: ['教育趋势', '数字化学习', '未来教育']
  },
  {
    id: 5,
    title: '提高学习专注力的10个实用技巧',
    description: '基于认知科学研究的专注力训练方法，帮助学生集中注意力。',
    author: '心理学专家',
    date: '2025年1月5日',
    readTime: '4分钟阅读',
    category: '学习心理',
    tags: ['专注力', '学习效率', '心理调节']
  },
  {
    id: 6,
    title: '多元智能理论在个性化学习中的应用',
    description: '探讨如何根据不同的智能类型设计个性化的学习方案。',
    author: '教育心理学家',
    date: '2025年1月3日',
    readTime: '9分钟阅读',
    category: '教育理论',
    tags: ['多元智能', '个性化学习', '因材施教']
  },
  {
    id: 7,
    title: '在线学习平台选择指南：如何找到适合自己的工具',
    description: '全面分析不同在线学习平台的特点，帮助用户做出明智选择。',
    author: '产品分析师',
    date: '2025年1月1日',
    readTime: '6分钟阅读',
    category: '产品评测',
    tags: ['在线学习', '平台对比', '用户指南']
  }
]

const categories = [
  { name: 'AI技术', count: 12, color: 'bg-blue-100 text-blue-700' },
  { name: '学习方法', count: 18, color: 'bg-green-100 text-green-700' },
  { name: '学科指导', count: 24, color: 'bg-purple-100 text-purple-700' },
  { name: '教育科技', count: 15, color: 'bg-orange-100 text-orange-700' },
  { name: '学习心理', count: 9, color: 'bg-red-100 text-red-700' },
  { name: '教育理论', count: 7, color: 'bg-indigo-100 text-indigo-700' }
]

const popularTags = [
  'AI', '个性化学习', '学习效率', '错题分析', '教育科技', '数学学习', 
  '心理调节', '解题技巧', '复习策略', '专注力', '在线学习', '因材施教'
]

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center max-w-4xl mx-auto mb-16">
          <BookOpen className="h-20 w-20 text-blue-600 mx-auto mb-6" />
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            QuizMate 博客
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            分享学习方法、教育科技和AI技术的最新见解
          </p>
          
          {/* Search Box */}
          <div className="max-w-2xl mx-auto">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <Input
                placeholder="搜索文章、标签或关键词..."
                className="pl-12 pr-4 py-6 text-lg border-2 focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3 space-y-8">
            {/* Featured Post */}
            <Card className="overflow-hidden border-0 shadow-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white">
              <CardContent className="p-8">
                <Badge className="mb-4 bg-white/20 text-white hover:bg-white/30">
                  特色文章
                </Badge>
                <h2 className="text-3xl font-bold mb-4 leading-tight">
                  {featuredPost.title}
                </h2>
                <p className="text-blue-100 mb-6 text-lg leading-relaxed">
                  {featuredPost.description}
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4 text-blue-100">
                    <div className="flex items-center">
                      <User className="h-4 w-4 mr-1" />
                      {featuredPost.author}
                    </div>
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      {featuredPost.date}
                    </div>
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-1" />
                      {featuredPost.readTime}
                    </div>
                  </div>
                  <Button variant="secondary" size="lg">
                    阅读全文
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Blog Posts Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {blogPosts.map((post) => (
                <Card key={post.id} className="hover:shadow-lg transition-all duration-200 cursor-pointer group h-full">
                  <CardHeader>
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant="outline" className="text-xs">
                        {post.category}
                      </Badge>
                      <span className="text-xs text-gray-500">{post.date}</span>
                    </div>
                    <CardTitle className="text-xl leading-tight group-hover:text-blue-600 transition-colors">
                      {post.title}
                    </CardTitle>
                    <CardDescription className="text-gray-600 leading-relaxed">
                      {post.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3 text-sm text-gray-500">
                        <div className="flex items-center">
                          <User className="h-3 w-3 mr-1" />
                          {post.author}
                        </div>
                        <div className="flex items-center">
                          <Clock className="h-3 w-3 mr-1" />
                          {post.readTime}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-1 mb-4">
                      {post.tags.map((tag, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>

                    <Button variant="outline" className="w-full group-hover:bg-blue-50 group-hover:border-blue-200 transition-colors">
                      阅读全文
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Load More */}
            <div className="text-center">
              <Button size="lg" variant="outline">
                加载更多文章
              </Button>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Categories */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <Target className="h-5 w-5 mr-2" />
                  分类
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {categories.map((category, index) => (
                  <div key={index} className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                    <span className="font-medium">{category.name}</span>
                    <Badge variant="secondary" className="text-xs">
                      {category.count}
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Popular Tags */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <TrendingUp className="h-5 w-5 mr-2" />
                  热门标签
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {popularTags.map((tag, index) => (
                    <Badge key={index} variant="outline" className="cursor-pointer hover:bg-blue-50 hover:border-blue-200 transition-colors">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Newsletter */}
            <Card className="bg-gradient-to-br from-blue-50 to-purple-50 border-blue-200">
              <CardHeader>
                <CardTitle className="text-lg flex items-center text-blue-700">
                  <Lightbulb className="h-5 w-5 mr-2" />
                  订阅更新
                </CardTitle>
                <CardDescription>
                  获取最新的学习方法和教育科技资讯
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input placeholder="输入您的邮箱" />
                <Button className="w-full">
                  订阅
                </Button>
                <p className="text-xs text-gray-500 text-center">
                  我们承诺不会发送垃圾邮件
                </p>
              </CardContent>
            </Card>

            {/* About */}
            <Card>
              <CardContent className="p-6 text-center">
                <h3 className="font-bold text-gray-900 mb-2">关于博客</h3>
                <p className="text-sm text-gray-600 mb-4">
                  QuizMate博客致力于分享最新的学习方法、教育科技趋势和AI技术应用，帮助学生和教育工作者提高效率。
                </p>
                <Button asChild variant="outline" size="sm">
                  <Link href="/about">
                    了解更多
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

export const metadata = {
  title: 'Blog - QuizMate',
  description: 'QuizMate博客 - 分享学习方法、教育科技和AI技术的最新见解，帮助学生提高学习效率。',
}