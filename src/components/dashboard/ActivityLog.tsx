'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Clock, 
  Filter,
  RefreshCw,
  ChevronRight,
  Activity
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface ActivityRecord {
  id: string
  action: string
  displayName: string
  details: any
  timestamp: string
  icon: string
  color: string
}

interface ActivityLogProps {
  className?: string
  limit?: number
  showFilters?: boolean
}

export default function ActivityLog({ 
  className = '', 
  limit = 20,
  showFilters = true 
}: ActivityLogProps) {
  const [activities, setActivities] = useState<ActivityRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string | null>(null)
  const [page, setPage] = useState(1)

  const fetchActivities = async () => {
    try {
      setLoading(true)
      const url = new URL('/api/user-activities', window.location.origin)
      url.searchParams.set('limit', limit.toString())
      url.searchParams.set('page', page.toString())
      if (filter) {
        url.searchParams.set('action', filter)
      }

      const response = await fetch(url.toString())
      const data = await response.json()

      if (data.success) {
        setActivities(data.data)
      } else {
        console.error('获取活动记录失败:', data.error)
      }
    } catch (error) {
      console.error('获取活动记录失败:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchActivities()
  }, [filter, page, limit])

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date()
    const time = new Date(timestamp)
    const diffInMinutes = Math.floor((now.getTime() - time.getTime()) / 60000)

    if (diffInMinutes < 1) return '刚刚'
    if (diffInMinutes < 60) return `${diffInMinutes}分钟前`
    
    const diffInHours = Math.floor(diffInMinutes / 60)
    if (diffInHours < 24) return `${diffInHours}小时前`
    
    const diffInDays = Math.floor(diffInHours / 24)
    if (diffInDays < 30) return `${diffInDays}天前`
    
    const diffInMonths = Math.floor(diffInDays / 30)
    return `${diffInMonths}个月前`
  }

  const getColorClass = (color: string) => {
    const colors = {
      blue: 'bg-blue-100 text-blue-800 border-blue-200',
      green: 'bg-green-100 text-green-800 border-green-200',
      purple: 'bg-purple-100 text-purple-800 border-purple-200',
      orange: 'bg-orange-100 text-orange-800 border-orange-200',
      red: 'bg-red-100 text-red-800 border-red-200',
      indigo: 'bg-indigo-100 text-indigo-800 border-indigo-200',
      gray: 'bg-gray-100 text-gray-800 border-gray-200',
      teal: 'bg-teal-100 text-teal-800 border-teal-200',
      pink: 'bg-pink-100 text-pink-800 border-pink-200'
    }
    return colors[color as keyof typeof colors] || colors.gray
  }

  const filterOptions = [
    { value: null, label: '全部活动' },
    { value: 'ai_analysis', label: 'AI解析' },
    { value: 'question_access', label: '题库访问' },
    { value: 'practice_session', label: '练习答题' },
    { value: 'subscription_upgrade', label: '订阅升级' }
  ]

  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-lg font-semibold flex items-center">
          <Activity className="h-5 w-5 mr-2" />
          最近活动
        </CardTitle>
        <div className="flex items-center space-x-2">
          {showFilters && (
            <select
              value={filter || ''}
              onChange={(e) => setFilter(e.target.value || null)}
              className="text-sm border rounded-md px-2 py-1 bg-white"
            >
              {filterOptions.map((option) => (
                <option key={option.value || 'all'} value={option.value || ''}>
                  {option.label}
                </option>
              ))}
            </select>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchActivities()}
            disabled={loading}
            className="px-2"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {loading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded animate-pulse" />
                  <div className="h-3 bg-gray-200 rounded w-1/2 animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        ) : activities.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>暂无活动记录</p>
          </div>
        ) : (
          <div className="space-y-3">
            <AnimatePresence>
              {activities.map((activity, index) => (
                <motion.div
                  key={activity.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-start space-x-3 p-3 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-sm">
                    {activity.icon}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-medium text-gray-900">
                        {activity.displayName}
                      </h4>
                      <Badge 
                        variant="secondary"
                        className={`text-xs ${getColorClass(activity.color)}`}
                      >
                        {activity.action}
                      </Badge>
                    </div>
                    
                    {activity.details && (
                      <div className="mt-1 text-xs text-gray-600">
                        {activity.action === 'ai_analysis' && activity.details.subject && (
                          <span>学科: {activity.details.subject}</span>
                        )}
                        {activity.action === 'question_access' && activity.details.questions_count && (
                          <span>访问了 {activity.details.questions_count} 道题目</span>
                        )}
                        {activity.action === 'subscription_upgrade' && activity.details.plan && (
                          <span>升级到 {activity.details.plan} 版本</span>
                        )}
                      </div>
                    )}
                    
                    <div className="flex items-center mt-2 text-xs text-gray-500">
                      <Clock className="h-3 w-3 mr-1" />
                      {formatTimeAgo(activity.timestamp)}
                    </div>
                  </div>
                  
                  <ChevronRight className="h-4 w-4 text-gray-400" />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
        
        {activities.length > 0 && activities.length >= limit && (
          <div className="text-center pt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(page + 1)}
              disabled={loading}
            >
              加载更多
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}