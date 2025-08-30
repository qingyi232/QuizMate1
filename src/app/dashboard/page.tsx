'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs'
import UsageBadge from '@/components/usage-badge'
import { 
  Brain, 
  Clock, 
  TrendingUp, 
  BookOpen, 
  Target, 
  Calendar,
  BarChart3,
  Repeat,
  Award,
  ChevronRight,
  RefreshCw,
  Play,
  Eye,
  Trash2,
  Star
} from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import ActivityLog from '@/components/dashboard/ActivityLog'

// Types
interface RecentQuestion {
  id: string
  content: string
  subject?: string
  created_at: string
  answer?: {
    answer: string
    explanation: string
    confidence?: number
  }
  flashcards_count: number
}

interface FlashcardForReview {
  id: string
  front: string
  back: string
  difficulty: number
  spaced_due_at: string
  question: {
    subject?: string
    content: string
  }
}

interface UserStats {
  questionsThisWeek: number
  flashcardsStudied: number
  averageAccuracy: number
  studyStreak: number
  totalQuestions: number
  totalFlashcards: number
}

interface UsageInfo {
  plan: string
  today: {
    used: number
    remaining: number
    limit: number
    cacheHits: number
    tokensUsed: number
    costCents: number
    date: string
  }
  month: {
    requests: number
    tokens: number
    costCents: number
    period: string
  }
  canMakeRequest: boolean
  upgradeRequired: boolean
}

export default function DashboardPage() {
  const router = useRouter()
  
  // State
  const [recentQuestions, setRecentQuestions] = useState<RecentQuestion[]>([])
  const [flashcardsForReview, setFlashcardsForReview] = useState<FlashcardForReview[]>([])
  const [userStats, setUserStats] = useState<UserStats | null>(null)
  const [usage, setUsage] = useState<UsageInfo | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  // Load dashboard data on mount
  useEffect(() => {
    loadDashboardData()
  }, [])

  // Load all dashboard data
  const loadDashboardData = async () => {
    setIsLoading(true)
    setError('')
    
    try {
      await Promise.all([
        loadRecentQuestions(),
        loadFlashcardsForReview(),
        loadUserStats(),
        loadUsageInfo()
      ])
    } catch (err) {
      console.error('Dashboard load error:', err)
      setError('Failed to load dashboard data')
    } finally {
      setIsLoading(false)
    }
  }

  // Load recent questions
  const loadRecentQuestions = async () => {
    try {
      // For now, return mock data - in real implementation, call API
      const mockQuestions: RecentQuestion[] = [
        {
          id: '1',
          content: 'What is the capital of France?',
          subject: 'Geography',
          created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
          answer: {
            answer: 'Paris',
            explanation: 'Paris is the capital and largest city of France.',
            confidence: 0.95
          },
          flashcards_count: 2
        },
        {
          id: '2', 
          content: 'Solve: 2x + 5 = 17',
          subject: 'Mathematics',
          created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
          answer: {
            answer: 'x = 6',
            explanation: 'Subtract 5 from both sides: 2x = 12. Then divide by 2: x = 6.',
            confidence: 1.0
          },
          flashcards_count: 3
        },
        {
          id: '3',
          content: 'What are the main causes of climate change?',
          subject: 'Environmental Science',
          created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
          answer: {
            answer: 'Greenhouse gas emissions, deforestation, and industrial activities',
            explanation: 'The primary causes include CO2 emissions from fossil fuels...',
            confidence: 0.88
          },
          flashcards_count: 5
        }
      ]
      setRecentQuestions(mockQuestions)
    } catch (err) {
      console.error('Load recent questions error:', err)
    }
  }

  // Load flashcards for review
  const loadFlashcardsForReview = async () => {
    try {
      // For now, return mock data - in real implementation, call /api/flashcards?due_only=true
      const mockFlashcards: FlashcardForReview[] = [
        {
          id: '1',
          front: 'What is the capital of France?',
          back: 'Paris',
          difficulty: 2,
          spaced_due_at: new Date().toISOString(),
          question: {
            subject: 'Geography',
            content: 'What is the capital of France?'
          }
        },
        {
          id: '2',
          front: 'What is 2x + 5 = 17?',
          back: 'x = 6 (subtract 5, then divide by 2)',
          difficulty: 3,
          spaced_due_at: new Date(Date.now() - 60 * 60 * 1000).toISOString(), // 1 hour overdue
          question: {
            subject: 'Mathematics',
            content: 'Solve: 2x + 5 = 17'
          }
        }
      ]
      setFlashcardsForReview(mockFlashcards)
    } catch (err) {
      console.error('Load flashcards error:', err)
    }
  }

  // Load user statistics
  const loadUserStats = async () => {
    try {
      // For now, return mock data - in real implementation, aggregate from database
      const mockStats: UserStats = {
        questionsThisWeek: 12,
        flashcardsStudied: 24,
        averageAccuracy: 85,
        studyStreak: 5,
        totalQuestions: 89,
        totalFlashcards: 156
      }
      setUserStats(mockStats)
    } catch (err) {
      console.error('Load user stats error:', err)
    }
  }

  // Load usage information
  const loadUsageInfo = async () => {
    try {
      const response = await fetch('/api/usage')
      if (response.ok) {
        const data = await response.json()
        // Ensure compatibility with UsageBadge component
        if (data.today && !data.today.hasOwnProperty('errors')) {
          data.today.errors = 0
        }
        setUsage(data)
      }
    } catch (err) {
      console.error('Load usage info error:', err)
    }
  }

  // Format relative time
  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / (1000 * 60))
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    if (diffMins < 60) {
      return `${diffMins} minutes ago`
    } else if (diffHours < 24) {
      return `${diffHours} hours ago`
    } else {
      return `${diffDays} days ago`
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="flex items-center justify-center h-64">
                          <RefreshCw className="h-8 w-8 animate-spin text-blue-600" />
            <span className="ml-2 text-lg">Loading dashboard...</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              <Brain className="inline-block mr-3 h-10 w-10 text-blue-600" />
              Dashboard
            </h1>
            <p className="text-xl text-gray-600">
              Track your learning progress and continue studying
            </p>
          </div>
          
          <div className="mt-4 md:mt-0 flex items-center space-x-4">
            <UsageBadge usage={usage} onRefresh={loadUsageInfo} />
            <Button onClick={() => router.push('/quiz')} size="lg">
              <Play className="mr-2 h-5 w-5" />
              New Question
            </Button>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-600">{error}</p>
            <Button variant="outline" size="sm" onClick={loadDashboardData} className="mt-2">
              <RefreshCw className="mr-2 h-4 w-4" />
              Retry
            </Button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Statistics Overview */}
            {userStats && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-4 text-center">
                    <TrendingUp className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                    <div className="text-2xl font-bold">{userStats.questionsThisWeek}</div>
                    <div className="text-sm text-muted-foreground">This Week</div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-4 text-center">
                    <Repeat className="h-8 w-8 text-green-500 mx-auto mb-2" />
                    <div className="text-2xl font-bold">{userStats.flashcardsStudied}</div>
                    <div className="text-sm text-muted-foreground">Cards Studied</div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-4 text-center">
                    <Target className="h-8 w-8 text-purple-500 mx-auto mb-2" />
                    <div className="text-2xl font-bold">{userStats.averageAccuracy}%</div>
                    <div className="text-sm text-muted-foreground">Accuracy</div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-4 text-center">
                    <Award className="h-8 w-8 text-orange-500 mx-auto mb-2" />
                    <div className="text-2xl font-bold">{userStats.studyStreak}</div>
                    <div className="text-sm text-muted-foreground">Day Streak</div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Recent Questions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center">
                    <Clock className="mr-2 h-5 w-5" />
                    Recent Questions
                  </span>
                  <Link href="/quiz">
                    <Button variant="outline" size="sm">
                      <Play className="mr-1 h-3 w-3" />
                      Ask New
                    </Button>
                  </Link>
                </CardTitle>
                <CardDescription>
                  Your latest questions and AI answers
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {recentQuestions.length === 0 ? (
                  <div className="text-center py-8">
                    <BookOpen className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      No questions yet
                    </h3>
                    <p className="text-gray-600 mb-4">
                      Start by asking your first question to get AI-powered explanations.
                    </p>
                    <Link href="/quiz">
                      <Button>
                        <Play className="mr-2 h-4 w-4" />
                        Ask Your First Question
                      </Button>
                    </Link>
                  </div>
                ) : (
                  recentQuestions.map((question) => (
                    <div key={question.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <h4 className="font-medium text-sm mb-1 line-clamp-2">
                            {question.content}
                          </h4>
                          <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                            {question.subject && (
                              <Badge variant="secondary" className="text-xs">
                                {question.subject}
                              </Badge>
                            )}
                            <span>{formatRelativeTime(question.created_at)}</span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2 ml-4">
                          <Badge variant="outline" className="text-xs">
                            {question.flashcards_count} cards
                          </Badge>
                          <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                            <Eye className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                      
                      {question.answer && (
                        <div className="mt-2 p-2 bg-blue-50 rounded text-sm">
                          <div className="font-medium text-blue-900 mb-1">
                            {question.answer.answer}
                          </div>
                          <div className="text-blue-700 text-xs line-clamp-2">
                            {question.answer.explanation}
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Flashcards for Review */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center">
                    <Repeat className="mr-2 h-5 w-5" />
                    Ready for Review
                  </span>
                  <Badge variant={flashcardsForReview.length > 0 ? "default" : "secondary"}>
                    {flashcardsForReview.length}
                  </Badge>
                </CardTitle>
                <CardDescription>
                  Flashcards scheduled for spaced repetition
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {flashcardsForReview.length === 0 ? (
                  <div className="text-center py-4">
                    <Repeat className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                    <p className="text-sm text-muted-foreground">
                      No cards due for review
                    </p>
                  </div>
                ) : (
                  <>
                    {flashcardsForReview.slice(0, 3).map((card) => (
                      <div key={card.id} className="border rounded-lg p-3 bg-gradient-to-r from-green-50 to-blue-50">
                        <div className="font-medium text-sm mb-1 line-clamp-2">
                          {card.front}
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <Badge variant="outline" className="text-xs">
                            {card.question.subject || 'General'}
                          </Badge>
                          <div className="flex items-center">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`h-3 w-3 ${
                                  i < card.difficulty 
                                    ? 'text-yellow-400 fill-current' 
                                    : 'text-gray-300'
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    <Button className="w-full" size="sm">
                      <Repeat className="mr-2 h-4 w-4" />
                      Start Review Session
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart3 className="mr-2 h-5 w-5" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link href="/quiz">
                  <Button variant="outline" className="w-full justify-start">
                    <Play className="mr-2 h-4 w-4" />
                    Ask New Question
                  </Button>
                </Link>
                
                <Button variant="outline" className="w-full justify-start">
                  <Repeat className="mr-2 h-4 w-4" />
                  Review Flashcards
                </Button>
                
                <Link href="/settings">
                  <Button variant="outline" className="w-full justify-start">
                    <BarChart3 className="mr-2 h-4 w-4" />
                    View Statistics
                  </Button>
                </Link>
                
                <Link href="/settings">
                  <Button variant="outline" className="w-full justify-start">
                    <Calendar className="mr-2 h-4 w-4" />
                    Manage Account
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Activity Log */}
            <ActivityLog 
              limit={10} 
              showFilters={false}
              className="max-h-96 overflow-y-auto"
            />

            {/* Progress Overview */}
            {userStats && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <TrendingUp className="mr-2 h-5 w-5" />
                    Progress Overview
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Questions This Week</span>
                      <span className="font-medium">{userStats.questionsThisWeek}/20</span>
                    </div>
                    <Progress value={(userStats.questionsThisWeek / 20) * 100} className="h-2" />
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Average Accuracy</span>
                      <span className="font-medium">{userStats.averageAccuracy}%</span>
                    </div>
                    <Progress value={userStats.averageAccuracy} className="h-2" />
                  </div>
                  
                  <div className="pt-2 border-t">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <div className="text-muted-foreground">Total Questions</div>
                        <div className="font-bold text-lg">{userStats.totalQuestions}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Total Cards</div>
                        <div className="font-bold text-lg">{userStats.totalFlashcards}</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}