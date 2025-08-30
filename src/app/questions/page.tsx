'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
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
  Plus,
  Globe,
  User,
  Star,
  CheckCircle,
  History,
  Clock,
  Languages,
  Target,
  BookMarked,
  Calculator,
  Atom,
  Palette,
  Briefcase,
  Cpu,
  GraduationCap,
  ChevronRight,
  Filter
} from 'lucide-react'
import Link from 'next/link'

// 学科分类接口
interface SubjectCategory {
  id: number
  category_name: string
  category_name_zh: string
  category_icon: string
  category_color: string
  description: string
  display_order: number
  total_questions: number
  subjects: string[]
}

// 题目接口
interface SubjectQuestion {
  id: string
  subject: string
  topic: string
  difficulty: 'easy' | 'medium' | 'hard'
  language: string
  question: string
  question_type: string
  options: Record<string, string> | null
  correct_answer: string
  explanation: string
  tags: string[]
  popularity_score: number
  verified: boolean
  category_name_zh?: string
  category_icon?: string
  category_color?: string
  topic_name_zh?: string
  created_at: string
}

// 用户错题本接口（保持原有）
interface UserQuestion {
  id: string
  content: string
  subject?: string
  grade?: string
  language: string
  source: 'paste' | 'upload' | 'scan' | 'import'
  original_file_name?: string
  mastery_level: number
  review_count: number
  created_at: string
  last_reviewed_at?: string
  ai_answer?: string
  ai_explanation?: string
  feedback_rating?: number
  model_used?: string
}

export default function EnhancedSubjectQuestionsPage() {
  // 当前活跃的标签页
  const [activeTab, setActiveTab] = useState<'practice' | 'user'>('practice')
  
  // 学科分类状态
  const [categories, setCategories] = useState<SubjectCategory[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [selectedSubject, setSelectedSubject] = useState<string>('')
  
  // 练习题库状态
  const [practiceQuestions, setPracticeQuestions] = useState<SubjectQuestion[]>([])
  const [practiceLoading, setPracticeLoading] = useState(false)
  const [practicePagination, setPracticePagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    hasMore: false
  })

  // 用户错题本状态
  const [userQuestions, setUserQuestions] = useState<UserQuestion[]>([])
  const [userLoading, setUserLoading] = useState(true)
  const [userPagination, setUserPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    hasMore: false
  })

  // 筛选器状态
  const [filters, setFilters] = useState({
    search: '',
    difficulty: 'all',
    topic: 'all',
    language: 'all',
    sort_by: 'popularity'
  })

  // 图标映射
  const getIconComponent = (iconName: string) => {
    const iconMap: Record<string, React.ComponentType<any>> = {
      calculator: Calculator,
      atom: Atom,
      'book-open': BookOpen,
      globe: Globe,
      cpu: Cpu,
      palette: Palette,
      briefcase: Briefcase
    }
    return iconMap[iconName] || BookOpen
  }

  // 获取学科分类
  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/subject-categories')
      const data = await response.json()
      
      if (data.success) {
        setCategories(data.data.categories)
        // 默认选择第一个分类
        if (data.data.categories.length > 0) {
          const firstCategory = data.data.categories[0]
          setSelectedCategory(firstCategory.category_name)
          if (firstCategory.subjects.length > 0) {
            setSelectedSubject(firstCategory.subjects[0])
          }
        }
      }
    } catch (error) {
      console.error('Error fetching categories:', error)
    }
  }

  // 获取练习题库
  const fetchPracticeQuestions = async () => {
    if (!selectedSubject) return
    
    try {
      setPracticeLoading(true)
      
      const params = new URLSearchParams({
        page: practicePagination.page.toString(),
        limit: practicePagination.limit.toString(),
        subject: selectedSubject,
        sort_by: filters.sort_by
      })

      if (filters.search) params.append('search', filters.search)
      if (filters.difficulty !== 'all') params.append('difficulty', filters.difficulty)
      if (filters.topic !== 'all') params.append('topic', filters.topic)
      if (filters.language !== 'all') params.append('language', filters.language)

      const response = await fetch(`/api/subject-questions?${params}`)
      const data = await response.json()

      if (data.success) {
        setPracticeQuestions(data.data.questions)
        setPracticePagination(data.data.pagination)
      }
    } catch (error) {
      console.error('Error fetching practice questions:', error)
    } finally {
      setPracticeLoading(false)
    }
  }

  // 获取用户错题本（保持原逻辑）
  const fetchUserQuestions = async () => {
    try {
      setUserLoading(true)
      
      const params = new URLSearchParams({
        page: userPagination.page.toString(),
        limit: userPagination.limit.toString(),
        user_only: 'true'
      })

      const response = await fetch(`/api/questions?${params}`)
      const data = await response.json()

      if (data.success) {
        const convertedQuestions: UserQuestion[] = data.data.questions.map((q: any) => ({
          id: q.id,
          content: q.content,
          subject: q.subject,
          grade: q.grade,
          language: q.language,
          source: 'upload' as const,
          original_file_name: q.meta?.original_file_name,
          mastery_level: 0,
          review_count: 0,
          created_at: q.created_at,
          ai_answer: q.answers?.[0]?.answer,
          ai_explanation: q.answers?.[0]?.explanation,
          model_used: q.answers?.[0]?.model
        }))
        
        setUserQuestions(convertedQuestions)
        setUserPagination(data.data.pagination)
      }
    } catch (error) {
      console.error('Error fetching user questions:', error)
    } finally {
      setUserLoading(false)
    }
  }

  // 初始加载
  useEffect(() => {
    fetchCategories()
  }, [])

  useEffect(() => {
    if (activeTab === 'practice' && selectedSubject) {
      fetchPracticeQuestions()
    } else if (activeTab === 'user') {
      fetchUserQuestions()
    }
  }, [activeTab, selectedSubject, practicePagination.page])

  // 筛选器变化时重新加载
  useEffect(() => {
    if (activeTab === 'practice') {
      setPracticePagination(prev => ({ ...prev, page: 1 }))
      fetchPracticeQuestions()
    }
  }, [filters])

  // 学科分类选择卡片
  const CategoryCard = ({ category }: { category: SubjectCategory }) => {
    const IconComponent = getIconComponent(category.category_icon)
    const isSelected = selectedCategory === category.category_name
    
    return (
      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="cursor-pointer"
        onClick={() => {
          setSelectedCategory(category.category_name)
          if (category.subjects.length > 0) {
            setSelectedSubject(category.subjects[0])
          }
        }}
      >
        <Card className={`h-full transition-all duration-200 ${
          isSelected 
            ? 'border-2 ring-2 ring-opacity-50' 
            : 'border hover:border-gray-300'
        }`} 
        style={{ 
          borderColor: isSelected ? category.category_color : undefined,
          ringColor: isSelected ? category.category_color + '50' : undefined
        }}>
          <CardContent className="p-4 text-center">
            <div 
              className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3"
              style={{ backgroundColor: category.category_color + '20' }}
            >
              <IconComponent 
                className="h-6 w-6" 
                style={{ color: category.category_color }} 
              />
            </div>
            <h3 className="font-semibold text-sm mb-1">
              {category.category_name_zh}
            </h3>
            <p className="text-xs text-gray-500 mb-2 line-clamp-2">
              {category.description}
            </p>
            <Badge 
              variant="outline" 
              className="text-xs"
              style={{ 
                borderColor: category.category_color,
                color: category.category_color 
              }}
            >
              {category.total_questions} 道题
            </Badge>
          </CardContent>
        </Card>
      </motion.div>
    )
  }

  // 练习题卡片
  const PracticeQuestionCard = ({ question }: { question: SubjectQuestion }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
    >
      <Card className="h-full hover:shadow-lg transition-shadow border-l-4 border-l-blue-500">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="space-y-2 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="outline" className="text-xs">
                  {question.topic_name_zh || question.topic}
                </Badge>
                <Badge variant={
                  question.difficulty === 'easy' ? 'secondary' :
                  question.difficulty === 'medium' ? 'default' : 'destructive'
                } className="text-xs">
                  {question.difficulty}
                </Badge>
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <Star className="h-3 w-3" />
                  <span>{question.popularity_score}</span>
                </div>
                {question.verified && (
                  <CheckCircle className="h-3 w-3 text-green-500" />
                )}
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-700 mb-4 line-clamp-3">
            {question.question}
          </p>
          
          {question.options && (
            <div className="text-xs text-gray-500 mb-3">
              选择题 • {Object.keys(question.options).length} 个选项
            </div>
          )}
          
          {question.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-3">
              {question.tags.slice(0, 3).map((tag, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          )}
          
          <div className="flex items-center justify-between">
            <div className="text-xs text-gray-500">
              <Languages className="inline h-3 w-3 mr-1" />
              {question.language.toUpperCase()}
            </div>
            <Link href={`/practice/${question.id}`}>
              <Button size="sm" className="text-xs">
                开始练习
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )

  // 用户题目卡片（保持原有逻辑）
  const UserQuestionCard = ({ question }: { question: UserQuestion }) => {
    const getMasteryBadge = (level: number) => {
      if (level === 0) return <Badge variant="destructive" className="text-xs">未掌握</Badge>
      if (level <= 2) return <Badge variant="secondary" className="text-xs">初步掌握</Badge>
      if (level <= 4) return <Badge variant="default" className="text-xs">基本掌握</Badge>
      return <Badge variant="default" className="text-xs bg-green-500">完全掌握</Badge>
    }

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ scale: 1.02 }}
        transition={{ duration: 0.2 }}
      >
        <Card className="h-full hover:shadow-lg transition-shadow border-l-4 border-l-green-500">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-green-500" />
                  {question.subject && (
                    <Badge variant="outline" className="text-xs">
                      {question.subject}
                    </Badge>
                  )}
                  <Badge variant="secondary" className="text-xs">
                    {question.source}
                  </Badge>
                  {getMasteryBadge(question.mastery_level)}
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <History className="h-3 w-3" />
                  <span>复习 {question.review_count} 次</span>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-700 mb-3 line-clamp-3">
              {question.content}
            </p>
            {question.original_file_name && (
              <p className="text-xs text-gray-500 mb-2">
                来源: {question.original_file_name}
              </p>
            )}
            <div className="flex items-center justify-between">
              <div className="text-xs text-gray-500">
                <span>{new Date(question.created_at).toLocaleDateString()}</span>
              </div>
              <Link href={`/quiz?question=${question.id}`}>
                <Button size="sm" variant="outline" className="text-xs">
                  复习题目
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    )
  }

  const totalPracticeQuestions = categories.reduce((sum, cat) => sum + cat.total_questions, 0)
  const totalUserQuestions = userPagination.total

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* 页面标题 */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-2 flex items-center justify-center gap-3">
            <BookOpen className="h-10 w-10 text-blue-600" />
            QuizMate 国际化题库中心
          </h1>
          <p className="text-gray-600 text-lg max-w-3xl mx-auto">
            🌍 7大学科分类 • 📚 国际化题目 • 🎯 智能练习 • 📝 个性化错题本
          </p>
        </motion.div>

        {/* 主要内容区域 */}
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'practice' | 'user')}>
          <div className="flex justify-center mb-8">
            <TabsList className="grid w-full max-w-md grid-cols-2 h-12">
              <TabsTrigger value="practice" className="flex items-center gap-2">
                <Globe className="h-4 w-4" />
                🌍 国际题库
                {totalPracticeQuestions > 0 && (
                  <Badge variant="secondary" className="ml-1">
                    {totalPracticeQuestions}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="user" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                📝 我的错题本
                {totalUserQuestions > 0 && (
                  <Badge variant="secondary" className="ml-1">
                    {totalUserQuestions}
                  </Badge>
                )}
              </TabsTrigger>
            </TabsList>
          </div>

          {/* 国际题库标签页 */}
          <TabsContent value="practice">
            <div className="space-y-8">
              {/* 学科分类选择区块 */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <GraduationCap className="h-5 w-5" />
                      选择学科分类
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
                      {categories.map((category, index) => (
                        <CategoryCard key={`category-${category.id}-${index}`} category={category} />
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* 筛选器 */}
              {selectedSubject && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Filter className="h-5 w-5" />
                      筛选 {categories.find(c => c.category_name === selectedCategory)?.category_name_zh} 题目
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-5 gap-4">
                      <Input
                        placeholder="搜索题目内容..."
                        value={filters.search}
                        onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                      />
                      <Select 
                        value={filters.difficulty} 
                        onValueChange={(value) => setFilters(prev => ({ ...prev, difficulty: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="选择难度" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">所有难度</SelectItem>
                          <SelectItem value="easy">简单</SelectItem>
                          <SelectItem value="medium">中等</SelectItem>
                          <SelectItem value="hard">困难</SelectItem>
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
                          <SelectItem value="en">英语</SelectItem>
                          <SelectItem value="zh">中文</SelectItem>
                        </SelectContent>
                      </Select>
                      <Select 
                        value={filters.sort_by} 
                        onValueChange={(value) => setFilters(prev => ({ ...prev, sort_by: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="排序方式" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="popularity">热门度</SelectItem>
                          <SelectItem value="difficulty">难度</SelectItem>
                          <SelectItem value="created_at">最新</SelectItem>
                          <SelectItem value="random">随机</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* 练习题列表 */}
              {selectedSubject ? (
                practiceLoading ? (
                  <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-2 text-gray-600">正在加载题目...</p>
                  </div>
                ) : practiceQuestions.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {practiceQuestions.map((question, index) => (
                      <PracticeQuestionCard key={`question-${question.id}-${index}`} question={question} />
                    ))}
                  </div>
                ) : (
                  <Card className="text-center py-12">
                    <CardContent>
                      <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        该学科题目正在准备中
                      </h3>
                      <p className="text-gray-600">
                        请选择其他学科或稍后再试
                      </p>
                    </CardContent>
                  </Card>
                )
              ) : (
                <Card className="text-center py-12">
                  <CardContent>
                    <GraduationCap className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      请选择学科分类
                    </h3>
                    <p className="text-gray-600">
                      点击上方学科卡片开始练习
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* 用户错题本标签页 */}
          <TabsContent value="user">
            <div className="space-y-6">
              {/* 错题本说明 */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    📝 我的专属错题本
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <p className="text-gray-600 mb-4">
                      您上传和解析过的题目会自动保存到这里，方便复习和管理
                    </p>
                    <div className="flex justify-center gap-2">
                      <Badge variant="outline">自动保存</Badge>
                      <Badge variant="outline">智能复习</Badge>
                      <Badge variant="outline">掌握跟踪</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* 用户题目列表 */}
              {userLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
                  <p className="mt-2 text-gray-600">正在加载错题本...</p>
                </div>
              ) : userQuestions.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {userQuestions.map((question, index) => (
                    <UserQuestionCard key={`user-question-${question.id}-${index}`} question={question} />
                  ))}
                </div>
              ) : (
                <Card className="text-center py-12">
                  <CardContent>
                    <BookMarked className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      错题本为空
                    </h3>
                    <p className="text-gray-600 mb-4">
                      开始解题后，系统会自动保存您的题目到错题本
                    </p>
                    <Link href="/quiz">
                      <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        开始解题
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}