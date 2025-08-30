'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Input } from "@/components/ui/input"
import { 
  ChevronLeft, 
  Clock, 
  CheckCircle, 
  XCircle,
  RotateCcw,
  BookOpen,
  Target,
  Award
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface QuestionData {
  id: string
  subject: string
  topic: string
  difficulty: 'easy' | 'medium' | 'hard'
  language: string
  question: string
  options?: string[]
  correct_answer: string
  explanation?: string
  created_at: string
}

export default function PracticePage() {
  const params = useParams()
  const router = useRouter()
  const questionId = params.id as string

  const [question, setQuestion] = useState<QuestionData | null>(null)
  const [selectedOption, setSelectedOption] = useState<string | null>(null)
  const [userAnswer, setUserAnswer] = useState<string>('')
  const [showAnswer, setShowAnswer] = useState(false)
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (questionId) {
      fetchQuestion(questionId)
    }
  }, [questionId])

  const fetchQuestion = async (id: string) => {
    try {
      setLoading(true)
      const response = await fetch(`/api/subject-questions/${id}`)
      
      if (!response.ok) {
        throw new Error('题目获取失败')
      }
      
      const data = await response.json()
      setQuestion(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : '未知错误')
    } finally {
      setLoading(false)
    }
  }

  const handleOptionSelect = (option: string) => {
    if (showAnswer) return
    setSelectedOption(option)
  }

  const handleSubmitAnswer = () => {
    if (!question) return
    
    let correct = false
    
    // 选择题模式
    if (question.options && question.options.length > 0) {
      if (!selectedOption) return
      // 尝试数值比较
      const selectedVal = parseFloat(selectedOption.trim())
      const correctVal = parseFloat(question.correct_answer.trim())
      
      if (!isNaN(selectedVal) && !isNaN(correctVal)) {
        correct = Math.abs(selectedVal - correctVal) < 0.01
      } else {
        correct = selectedOption.trim().toLowerCase() === question.correct_answer.trim().toLowerCase()
      }
    } 
    // 输入题模式
    else {
      if (!userAnswer.trim()) return
      // 对于数字答案，进行数值比较
      const userVal = parseFloat(userAnswer.trim())
      const correctVal = parseFloat(question.correct_answer.trim())
      
      if (!isNaN(userVal) && !isNaN(correctVal)) {
        correct = Math.abs(userVal - correctVal) < 0.01 // 允许小误差
      } else {
        correct = userAnswer.trim().toLowerCase() === question.correct_answer.trim().toLowerCase()
      }
    }
    
    setIsCorrect(correct)
    setShowAnswer(true)
  }

  const handleReset = () => {
    setSelectedOption(null)
    setUserAnswer('')
    setShowAnswer(false)
    setIsCorrect(null)
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800 border-green-200'
      case 'medium': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'hard': return 'bg-red-100 text-red-800 border-red-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getDifficultyText = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return '简单'
      case 'medium': return '中等'
      case 'hard': return '困难'
      default: return difficulty
    }
  }

  const getSubjectText = (subject: string) => {
    const subjectMap: Record<string, string> = {
      'Mathematics': '数学',
      'Physics': '物理',
      'Chemistry': '化学',
      'Biology': '生物',
      'English': '英语',
      'Computer_Science': '计算机科学',
      'History': '历史',
      'Science': '科学'
    }
    return subjectMap[subject] || subject
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">加载题目中...</p>
        </div>
      </div>
    )
  }

  if (error || !question) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center">
            <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">题目加载失败</h3>
            <p className="text-gray-600 mb-4">{error || '题目不存在'}</p>
            <Button onClick={() => router.back()} variant="outline">
              <ChevronLeft className="h-4 w-4 mr-2" />
              返回题库
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* 头部导航 */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Button 
            variant="ghost" 
            onClick={() => router.back()}
            className="flex items-center gap-2"
          >
            <ChevronLeft className="h-4 w-4" />
            返回题库
          </Button>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-indigo-600" />
              <span className="font-medium text-gray-900">题目练习</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="shadow-lg">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <Badge className={getDifficultyColor(question.difficulty)}>
                    {getDifficultyText(question.difficulty)}
                  </Badge>
                  <Badge variant="outline">
                    {getSubjectText(question.subject)}
                  </Badge>
                  {question.topic && (
                    <Badge variant="secondary">
                      {question.topic}
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Clock className="h-4 w-4" />
                  <span>{question.language.toUpperCase()}</span>
                </div>
              </div>
              
              <CardTitle className="text-xl leading-relaxed">
                {question.question}
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* 选择题选项 */}
              {question.options && question.options.length > 0 ? (
                <div className="space-y-3">
                  <h3 className="font-medium text-gray-900 flex items-center gap-2">
                    <Target className="h-4 w-4" />
                    选择答案：
                  </h3>
                  <div className="grid gap-3">
                    {question.options.map((option, index) => {
                      const optionLetter = String.fromCharCode(65 + index) // A, B, C, D
                      const isSelected = selectedOption === option
                      const isCorrectOption = showAnswer && option.trim() === question.correct_answer.trim()
                      const isWrongSelection = showAnswer && isSelected && !isCorrectOption

                      return (
                        <motion.div
                          key={index}
                          whileHover={{ scale: showAnswer ? 1 : 1.02 }}
                          whileTap={{ scale: showAnswer ? 1 : 0.98 }}
                        >
                          <div
                            onClick={() => handleOptionSelect(option)}
                            className={cn(
                              "p-4 rounded-lg border-2 cursor-pointer transition-all duration-200",
                              isSelected && !showAnswer && "border-indigo-500 bg-indigo-50",
                              !isSelected && !showAnswer && "border-gray-200 hover:border-gray-300 hover:bg-gray-50",
                              isCorrectOption && "border-green-500 bg-green-50",
                              isWrongSelection && "border-red-500 bg-red-50",
                              showAnswer && "cursor-not-allowed"
                            )}
                          >
                            <div className="flex items-center gap-3">
                              <div className={cn(
                                "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium",
                                isSelected && !showAnswer && "bg-indigo-500 text-white",
                                !isSelected && !showAnswer && "bg-gray-100 text-gray-600",
                                isCorrectOption && "bg-green-500 text-white",
                                isWrongSelection && "bg-red-500 text-white"
                              )}>
                                {optionLetter}
                              </div>
                              <span className="flex-1">{option}</span>
                              {showAnswer && isCorrectOption && (
                                <CheckCircle className="h-5 w-5 text-green-500" />
                              )}
                              {showAnswer && isWrongSelection && (
                                <XCircle className="h-5 w-5 text-red-500" />
                              )}
                            </div>
                          </div>
                        </motion.div>
                      )
                    })}
                  </div>
                </div>
              ) : (
                /* 输入题模式 */
                !showAnswer ? (
                  <div className="space-y-3">
                    <h3 className="font-medium text-gray-900 flex items-center gap-2">
                      <Target className="h-4 w-4" />
                      输入您的答案：
                    </h3>
                    <Input
                      placeholder="请输入您的答案..."
                      value={userAnswer}
                      onChange={(e) => setUserAnswer(e.target.value)}
                      className="text-lg p-4"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && userAnswer.trim()) {
                          handleSubmitAnswer()
                        }
                      }}
                    />
                    <p className="text-sm text-gray-500">
                      💡 提示：对于数字答案，请直接输入数值。按回车键提交答案。
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="space-y-3">
                      <h3 className="font-medium text-gray-900">您的答案：</h3>
                      <div className={cn(
                        "p-4 rounded-lg border-2",
                        isCorrect ? "border-green-500 bg-green-50" : "border-red-500 bg-red-50"
                      )}>
                        <p className={cn(
                          "font-medium",
                          isCorrect ? "text-green-800" : "text-red-800"
                        )}>
                          {userAnswer}
                          {isCorrect ? (
                            <CheckCircle className="inline h-5 w-5 ml-2 text-green-500" />
                          ) : (
                            <XCircle className="inline h-5 w-5 ml-2 text-red-500" />
                          )}
                        </p>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <h3 className="font-medium text-gray-900">标准答案：</h3>
                      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <p className="text-blue-900 font-medium">{question.correct_answer}</p>
                      </div>
                    </div>
                  </div>
                )
              )}

              {/* 操作按钮 */}
              {!showAnswer && (
                <div className="flex justify-center">
                  <Button 
                    onClick={handleSubmitAnswer}
                    disabled={
                      question.options && question.options.length > 0 
                        ? !selectedOption 
                        : !userAnswer.trim()
                    }
                    className="px-8"
                  >
                    提交答案
                  </Button>
                </div>
              )}

              {/* 结果显示 */}
              {showAnswer && (
                <div className="text-center">
                  <div className={cn(
                    "inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium",
                    isCorrect ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                  )}>
                    {isCorrect ? (
                      <>
                        <Award className="h-4 w-4" />
                        回答正确！
                      </>
                    ) : (
                      <>
                        <XCircle className="h-4 w-4" />
                        回答错误
                      </>
                    )}
                  </div>
                </div>
              )}

              {/* 解析 */}
              {showAnswer && question.explanation && (
                <>
                  <Separator />
                  <div className="space-y-3">
                    <h3 className="font-medium text-gray-900 flex items-center gap-2">
                      <BookOpen className="h-4 w-4" />
                      详细解析：
                    </h3>
                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <p className="text-gray-800 leading-relaxed">
                        {question.explanation}
                      </p>
                    </div>
                  </div>
                </>
              )}

              {/* 重新练习按钮 */}
              {showAnswer && (
                <div className="flex justify-center pt-4">
                  <Button onClick={handleReset} variant="outline">
                    <RotateCcw className="h-4 w-4 mr-2" />
                    重新练习
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}