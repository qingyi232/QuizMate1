'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select'
import { 
  Search, 
  BookOpen, 
  ChevronLeft, 
  ChevronRight,
  Plus,
  Upload,
  Brain,
  Clock,
  Languages
} from 'lucide-react'
import Link from 'next/link'
import { demoStorage } from '@/lib/demo/demo-storage'
import DemoModeBanner from '@/components/demo-mode-banner'

interface Question {
  id: string
  content: string
  subject?: string
  grade?: string
  language: string
  created_at: string
  answers?: Array<{
    id: string
    answer: string
    explanation: string
    confidence?: number
    model: string
  }>
  flashcards?: Array<{
    id: string
    front: string
    back: string
    difficulty: number
  }>
}

interface QuestionsResponse {
  success: boolean
  data: {
    questions: Question[]
    pagination: {
      page: number
      limit: number
      total: number
      hasMore: boolean
    }
  }
}

export default function QuestionsPage() {
  const [questions, setQuestions] = useState<Question[]>([])
  const [loading, setLoading] = useState(true)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    hasMore: false
  })

  const [filters, setFilters] = useState({
    search: '',
    subject: 'all',
    grade: 'all',
    language: 'all',
    user_only: false
  })

  const subjects = [
    'Mathematics', 'Science', 'English', 'History', 
    'Geography', 'Physics', 'Chemistry', 'Biology',
    'Computer Science', 'Economics', 'Philosophy'
  ]

  const grades = [
    'Elementary', 'Middle School', 'High School', 
    'University', 'Graduate', 'Professional'
  ]

  const languages = [
    { code: 'en', name: 'English' },
    { code: 'zh-CN', name: '中文' },
    { code: 'id', name: 'Bahasa Indonesia' },
    { code: 'fil', name: 'Filipino' },
    { code: 'sw', name: 'Kiswahili' }
  ]

  useEffect(() => {
    fetchQuestions()
  }, [pagination.page, filters])

  const fetchQuestions = async () => {
    setLoading(true)
    try {
      // 检查是否为演示模式
      if (demoStorage.isDemoMode()) {
        // 演示模式：从专业存储管理器读取数据
        console.log('🎭 演示模式：从本地存储读取题目')
        
        const result = demoStorage.getFilteredQuestions({
          search: filters.search,
          subject: filters.subject,
          grade: filters.grade,
          language: filters.language,
          page: pagination.page,
          limit: pagination.limit
        })
        
        setQuestions(result.questions)
        setPagination(prev => ({
          ...prev,
          total: result.total,
          hasMore: result.hasMore
        }))
      } else {
        // 生产模式：调用真实API
        const params = new URLSearchParams({
          page: pagination.page.toString(),
          limit: pagination.limit.toString(),
          ...(filters.search && { search: filters.search }),
          ...(filters.subject && filters.subject !== 'all' && { subject: filters.subject }),
          ...(filters.grade && filters.grade !== 'all' && { grade: filters.grade }),
          ...(filters.language && filters.language !== 'all' && { language: filters.language }),
          user_only: filters.user_only.toString()
        })

        const response = await fetch(`/api/questions?${params}`)
        const data: QuestionsResponse = await response.json()

        if (data.success) {
          setQuestions(data.data.questions)
          setPagination(prev => ({
            ...prev,
            total: data.data.pagination.total,
            hasMore: data.data.pagination.hasMore
          }))
        }
      }
    } catch (error) {
      console.error('Failed to fetch questions:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (value: string) => {
    setFilters(prev => ({ ...prev, search: value }))
    setPagination(prev => ({ ...prev, page: 1 }))
  }

  const formatContent = (content: string) => {
    if (content.length > 200) {
      return content.substring(0, 200) + '...'
    }
    return content
  }

  const getLanguageName = (code: string) => {
    const lang = languages.find(l => l.code === code)
    return lang?.name || code
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <BookOpen className="h-8 w-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">题库中心</h1>
            </div>
            <div className="flex items-center space-x-2">
              <Link href="/questions/import">
                <Button variant="outline" className="border-blue-600 text-blue-600 hover:bg-blue-50">
                  <Upload className="w-4 h-4 mr-2" />
                  批量导入
                </Button>
              </Link>
              <Link href="/quiz">
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="w-4 h-4 mr-2" />
                  创建题目
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Demo Mode Banner */}
        <DemoModeBanner />
        
        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8"
        >
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="搜索题目内容..."
                value={filters.search}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select
              value={filters.subject}
              onValueChange={(value) => setFilters(prev => ({ ...prev, subject: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="选择学科" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">所有学科</SelectItem>
                {subjects.map(subject => (
                  <SelectItem key={subject} value={subject}>
                    {subject}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={filters.grade}
              onValueChange={(value) => setFilters(prev => ({ ...prev, grade: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="选择年级" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">所有年级</SelectItem>
                {grades.map(grade => (
                  <SelectItem key={grade} value={grade}>
                    {grade}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={filters.language}
              onValueChange={(value) => setFilters(prev => ({ ...prev, language: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="选择语言" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">所有语言</SelectItem>
                {languages.map(lang => (
                  <SelectItem key={lang.code} value={lang.code}>
                    {lang.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              找到 {pagination.total} 个题目
            </div>
            
            <Button
              variant={filters.user_only ? "default" : "outline"}
              onClick={() => setFilters(prev => ({ ...prev, user_only: !prev.user_only }))}
              size="sm"
            >
              {filters.user_only ? '显示所有题目' : '只显示我的题目'}
            </Button>
          </div>
        </motion.div>

        {/* Questions Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-white rounded-xl h-64 border border-gray-200"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {questions.map((question, index) => (
              <motion.div
                key={question.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        {question.subject && (
                          <Badge variant="secondary" className="mb-2">
                            {question.subject}
                          </Badge>
                        )}
                        <CardTitle className="text-sm font-medium line-clamp-2">
                          {formatContent(question.content)}
                        </CardTitle>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="pt-0">
                    <div className="space-y-3">
                      {/* 元信息 */}
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        {question.grade && (
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {question.grade}
                          </div>
                        )}
                        <div className="flex items-center gap-1">
                          <Languages className="w-3 h-3" />
                          {getLanguageName(question.language)}
                        </div>
                      </div>

                      {/* AI解析状态 */}
                      {question.answers && question.answers.length > 0 && (
                        <div className="flex items-center gap-2">
                          <Brain className="w-4 h-4 text-green-600" />
                          <span className="text-sm text-green-600 font-medium">
                            已AI解析
                          </span>
                          {question.answers[0].confidence && (
                            <Badge variant="outline" className="text-xs">
                              {Math.round(question.answers[0].confidence * 100)}% 置信度
                            </Badge>
                          )}
                        </div>
                      )}

                      {/* 闪卡数量 */}
                      {question.flashcards && question.flashcards.length > 0 && (
                        <div className="text-sm text-gray-600">
                          📚 {question.flashcards.length} 张闪卡
                        </div>
                      )}

                      {/* 操作按钮 */}
                      <div className="flex gap-2 pt-2">
                        <Link href={`/quiz?question=${question.id}`} className="flex-1">
                          <Button size="sm" className="w-full">
                            查看详情
                          </Button>
                        </Link>
                        {question.flashcards && question.flashcards.length > 0 && (
                          <Link href={`/flashcards?question=${question.id}`}>
                            <Button size="sm" variant="outline">
                              复习
                            </Button>
                          </Link>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && questions.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <BookOpen className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              没有找到题目
            </h3>
            <p className="text-gray-600 mb-6">
              尝试调整搜索条件，或者创建第一个题目
            </p>
            <Link href="/quiz">
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                创建题目
              </Button>
            </Link>
          </motion.div>
        )}

        {/* Pagination */}
        {!loading && questions.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center justify-center space-x-2 mt-8"
          >
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
              disabled={pagination.page === 1}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            
            <span className="text-sm text-gray-600">
              第 {pagination.page} 页
            </span>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
              disabled={!pagination.hasMore}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </motion.div>
        )}
      </div>
    </div>
  )
}