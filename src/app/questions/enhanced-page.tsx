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
  ChevronLeft, 
  ChevronRight,
  Plus,
  Upload,
  Brain,
  Clock,
  Languages,
  Star,
  Trophy,
  Target,
  BarChart3,
  BookMarked,
  History,
  CheckCircle,
  AlertCircle,
  Globe,
  User
} from 'lucide-react'
import Link from 'next/link'

// 练习题库接口
interface PracticeQuestion {
  id: string
  content: string
  subject: string
  grade?: string
  language: string
  difficulty: 'easy' | 'medium' | 'hard'
  question_type: string
  tags: string[]
  popularity_score: number
  verified: boolean
  answer_text?: string
  explanation?: string
  created_at: string
}

// 用户错题本接口  
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

export default function EnhancedQuestionsPage() {
  // 当前活跃的标签页
  const [activeTab, setActiveTab] = useState<'practice' | 'user'>('practice')
  
  // 练习题库状态
  const [practiceQuestions, setPracticeQuestions] = useState<PracticeQuestion[]>([])
  const [practiceLoading, setPracticeLoading] = useState(true)
  const [practicePagination, setPracticePagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    hasMore: false
  })
  const [practiceStats, setPracticeStats] = useState({
    total_questions: 0,
    subjects: [] as Array<{ subject: string; count: number }>,
    difficulties: [] as Array<{ difficulty: string; count: number }>
  })

  // 用户错题本状态
  const [userQuestions, setUserQuestions] = useState<UserQuestion[]>([])
  const [userLoading, setUserLoading] = useState(true)
  const [userPagination, setUserPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    hasMore: false
  })
  const [userStats, setUserStats] = useState({
    total_questions: 0,
    mastery_distribution: [] as Array<{ mastery_level: number; count: number }>,
    learning_stats: [] as Array<{ 
      subject: string
      questions_solved: number
      questions_mastered: number
    }>
  })

  // 练习题库筛选器
  const [practiceFilters, setPracticeFilters] = useState({
    search: '',
    subject: 'all',
    grade: 'all',
    language: 'all',
    difficulty: 'all',
    question_type: 'all',
    verified_only: false,
    sort_by: 'popularity'
  })

  // 用户错题本筛选器
  const [userFilters, setUserFilters] = useState({
    search: '',
    subject: 'all',
    grade: 'all',
    language: 'all',
    source: 'all',
    mastery_level: 'all',
    needs_review: false,
    sort_by: 'created_at'
  })

  const subjects = [
    'math', 'physics', 'chemistry', 'biology', 'english', 'history', 
    'geography', 'computer_science', 'economics', 'art'
  ]

  const grades = [
    'elementary', 'middle_school', 'high_school', 'college'
  ]

  const difficulties = ['easy', 'medium', 'hard']
  const questionTypes = ['multiple_choice', 'short_answer', 'essay', 'calculation', 'coding']
  const sources = ['paste', 'upload', 'scan', 'import']

  // 获取练习题库
  const fetchPracticeQuestions = async () => {
    try {
      setPracticeLoading(true)
      const params = new URLSearchParams()
      
      params.append('page', practicePagination.page.toString())
      params.append('limit', practicePagination.limit.toString())
      
      if (practiceFilters.search) params.append('search', practiceFilters.search)
      if (practiceFilters.subject !== 'all') params.append('subject', practiceFilters.subject)
      if (practiceFilters.grade !== 'all') params.append('grade', practiceFilters.grade)
      if (practiceFilters.language !== 'all') params.append('language', practiceFilters.language)
      if (practiceFilters.difficulty !== 'all') params.append('difficulty', practiceFilters.difficulty)
      if (practiceFilters.question_type !== 'all') params.append('question_type', practiceFilters.question_type)
      if (practiceFilters.verified_only) params.append('verified_only', 'true')
      params.append('sort_by', practiceFilters.sort_by)

      const response = await fetch(`/api/practice-questions?${params}`)
      const data = await response.json()

      if (data.success) {
        setPracticeQuestions(data.data.questions)
        setPracticePagination(data.data.pagination)
        setPracticeStats(data.data.statistics)
      }
    } catch (error) {
      console.error('Error fetching practice questions:', error)
    } finally {
      setPracticeLoading(false)
    }
  }

  // 获取用户错题本
  const fetchUserQuestions = async () => {
    try {
      setUserLoading(true)
      const params = new URLSearchParams()
      
      params.append('page', userPagination.page.toString())
      params.append('limit', userPagination.limit.toString())
      
      if (userFilters.search) params.append('search', userFilters.search)
      if (userFilters.subject !== 'all') params.append('subject', userFilters.subject)
      if (userFilters.grade !== 'all') params.append('grade', userFilters.grade)
      if (userFilters.language !== 'all') params.append('language', userFilters.language)
      if (userFilters.source !== 'all') params.append('source', userFilters.source)
      if (userFilters.mastery_level !== 'all') params.append('mastery_level', userFilters.mastery_level)
      if (userFilters.needs_review) params.append('needs_review', 'true')
      params.append('sort_by', userFilters.sort_by)

      const response = await fetch(`/api/user-questions?${params}`)
      const data = await response.json()

      if (data.success) {
        setUserQuestions(data.data.questions)
        setUserPagination(data.data.pagination)
        setUserStats(data.data.user_statistics)
      }
    } catch (error) {
      console.error('Error fetching user questions:', error)
    } finally {
      setUserLoading(false)
    }
  }

  // 初始加载
  useEffect(() => {
    if (activeTab === 'practice') {
      fetchPracticeQuestions()
    } else {
      fetchUserQuestions()
    }
  }, [activeTab, practicePagination.page, userPagination.page])

  // 筛选器变化时重新加载
  useEffect(() => {
    if (activeTab === 'practice') {
      setPracticePagination(prev => ({ ...prev, page: 1 }))
      fetchPracticeQuestions()
    }
  }, [practiceFilters])

  useEffect(() => {
    if (activeTab === 'user') {
      setUserPagination(prev => ({ ...prev, page: 1 }))
      fetchUserQuestions()
    }
  }, [userFilters])

  // 练习题卡片组件
  const PracticeQuestionCard = ({ question }: { question: PracticeQuestion }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
    >
      <Card className="h-full hover:shadow-lg transition-shadow border-l-4 border-l-blue-500">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-blue-500" />
                <Badge variant="outline" className="text-xs">
                  {question.subject}
                </Badge>
                {question.grade && (
                  <Badge variant="secondary" className="text-xs">
                    {question.grade}
                  </Badge>
                )}
                <Badge variant={
                  question.difficulty === 'easy' ? 'secondary' :
                  question.difficulty === 'medium' ? 'default' : 'destructive'
                } className="text-xs">
                  {question.difficulty}
                </Badge>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <Star className="h-3 w-3" />
                <span>{question.popularity_score}</span>
                {question.verified && (
                  <>
                    <CheckCircle className="h-3 w-3 text-green-500" />
                    <span>已验证</span>
                  </>
                )}
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-700 mb-3 line-clamp-3">
            {question.content}
          </p>
          {question.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-3">
              {question.tags.slice(0, 3).map((tag, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
              {question.tags.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{question.tags.length - 3}
                </Badge>
              )}
            </div>
          )}
          <div className="flex items-center justify-between">
            <div className="text-xs text-gray-500">
              <Languages className="inline h-3 w-3 mr-1" />
              {question.language.toUpperCase()}
            </div>
            <Link href={`/quiz?practice_question=${question.id}`}>
              <Button size="sm" className="text-xs">
                开始练习
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )

  // 用户题目卡片组件
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
                  {question.last_reviewed_at && (
                    <>
                      <Clock className="h-3 w-3" />
                      <span>
                        上次复习: {new Date(question.last_reviewed_at).toLocaleDateString()}
                      </span>
                    </>
                  )}
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
                来源文件: {question.original_file_name}
              </p>
            )}
            <div className="flex items-center justify-between">
              <div className="text-xs text-gray-500">
                <span>{new Date(question.created_at).toLocaleDateString()}</span>
              </div>
              <Link href={`/quiz?user_question=${question.id}`}>
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
            题库中心
          </h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            探索全球经典题目，管理个人错题本，提升学习效率
          </p>
        </motion.div>

        {/* 主要内容区域 */}
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'practice' | 'user')}>
          <div className="flex justify-center mb-8">
            <TabsList className="grid w-full max-w-md grid-cols-2 h-12">
              <TabsTrigger value="practice" className="flex items-center gap-2">
                <Globe className="h-4 w-4" />
                练习题库
                {practiceStats.total_questions > 0 && (
                  <Badge variant="secondary" className="ml-1">
                    {practiceStats.total_questions}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="user" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                我的错题本
                {userStats.total_questions > 0 && (
                  <Badge variant="secondary" className="ml-1">
                    {userStats.total_questions}
                  </Badge>
                )}
              </TabsTrigger>
            </TabsList>
          </div>

          {/* 练习题库标签页 */}
          <TabsContent value="practice">
            <div className="space-y-6">
              {/* 筛选器 */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Search className="h-5 w-5" />
                    筛选练习题
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    <Input
                      placeholder="搜索题目内容..."
                      value={practiceFilters.search}
                      onChange={(e) => setPracticeFilters(prev => ({ ...prev, search: e.target.value }))}
                    />
                    <Select 
                      value={practiceFilters.subject} 
                      onValueChange={(value) => setPracticeFilters(prev => ({ ...prev, subject: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="选择学科" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">所有学科</SelectItem>
                        {subjects.map(subject => (
                          <SelectItem key={subject} value={subject}>{subject}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select 
                      value={practiceFilters.difficulty} 
                      onValueChange={(value) => setPracticeFilters(prev => ({ ...prev, difficulty: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="选择难度" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">所有难度</SelectItem>
                        {difficulties.map(difficulty => (
                          <SelectItem key={difficulty} value={difficulty}>{difficulty}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select 
                      value={practiceFilters.sort_by} 
                      onValueChange={(value) => setPracticeFilters(prev => ({ ...prev, sort_by: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="排序方式" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="popularity">热门度</SelectItem>
                        <SelectItem value="difficulty">难度</SelectItem>
                        <SelectItem value="created_at">最新</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              {/* 练习题列表 */}
              {practiceLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-2 text-gray-600">正在加载练习题...</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {practiceQuestions.map(question => (
                    <PracticeQuestionCard key={question.id} question={question} />
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          {/* 用户错题本标签页 */}
          <TabsContent value="user">
            <div className="space-y-6">
              {/* 学习统计 */}
              {userStats.learning_stats.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {userStats.learning_stats.slice(0, 3).map((stat, index) => (
                    <Card key={index}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-600">{stat.subject}</p>
                            <p className="text-2xl font-bold text-blue-600">{stat.questions_solved}</p>
                            <p className="text-xs text-gray-500">已解答 / {stat.questions_mastered} 已掌握</p>
                          </div>
                          <Target className="h-8 w-8 text-blue-500" />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}

              {/* 筛选器 */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Search className="h-5 w-5" />
                    筛选错题本
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    <Input
                      placeholder="搜索题目内容..."
                      value={userFilters.search}
                      onChange={(e) => setUserFilters(prev => ({ ...prev, search: e.target.value }))}
                    />
                    <Select 
                      value={userFilters.mastery_level} 
                      onValueChange={(value) => setUserFilters(prev => ({ ...prev, mastery_level: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="掌握程度" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">所有程度</SelectItem>
                        <SelectItem value="0">未掌握</SelectItem>
                        <SelectItem value="1">初步掌握</SelectItem>
                        <SelectItem value="2">基本掌握</SelectItem>
                        <SelectItem value="3">熟练掌握</SelectItem>
                        <SelectItem value="4">完全掌握</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select 
                      value={userFilters.source} 
                      onValueChange={(value) => setUserFilters(prev => ({ ...prev, source: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="题目来源" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">所有来源</SelectItem>
                        {sources.map(source => (
                          <SelectItem key={source} value={source}>{source}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <div className="flex items-center space-x-2">
                      <input 
                        type="checkbox" 
                        id="needs_review"
                        checked={userFilters.needs_review}
                        onChange={(e) => setUserFilters(prev => ({ ...prev, needs_review: e.target.checked }))}
                      />
                      <label htmlFor="needs_review" className="text-sm">需要复习</label>
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
                  {userQuestions.map(question => (
                    <UserQuestionCard key={question.id} question={question} />
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