import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth/auth'
import { getUserActivities } from '@/lib/permissions'

export async function GET(request: NextRequest) {
  try {
    // Get current user
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '50', 10)
    const page = parseInt(searchParams.get('page') || '1', 10)
    const action = searchParams.get('action')

    // Get user activities with pagination
    const activities = await getUserActivities(user.email, limit)

    // Filter by action if specified
    const filteredActivities = action 
      ? activities.filter(activity => activity.action === action)
      : activities

    // Apply pagination
    const offset = (page - 1) * limit
    const paginatedActivities = filteredActivities.slice(offset, offset + limit)

    // Transform activities for frontend
    const transformedActivities = paginatedActivities.map(activity => ({
      id: activity.id,
      action: activity.action,
      details: activity.details,
      timestamp: activity.created_at,
      displayName: getActionDisplayName(activity.action),
      icon: getActionIcon(activity.action),
      color: getActionColor(activity.action)
    }))

    return NextResponse.json({
      success: true,
      data: transformedActivities,
      pagination: {
        page,
        limit,
        total: filteredActivities.length,
        hasMore: offset + limit < filteredActivities.length
      }
    })

  } catch (error) {
    console.error('获取用户活动记录失败:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Helper functions for activity display
function getActionDisplayName(action: string): string {
  const actionNames = {
    'ai_analysis': 'AI智能解析',
    'question_access': '题库访问',
    'subscription_upgrade': '订阅升级',
    'practice_session': '练习答题',
    'error_book_add': '错题本添加',
    'statistics_view': '统计查看',
    'profile_update': '资料更新',
    'login': '用户登录',
    'logout': '用户登出'
  }
  return actionNames[action] || action
}

function getActionIcon(action: string): string {
  const actionIcons = {
    'ai_analysis': '🤖',
    'question_access': '📚',
    'subscription_upgrade': '⬆️',
    'practice_session': '🎯',
    'error_book_add': '❌',
    'statistics_view': '📊',
    'profile_update': '👤',
    'login': '🔐',
    'logout': '🔒'
  }
  return actionIcons[action] || '📝'
}

function getActionColor(action: string): string {
  const actionColors = {
    'ai_analysis': 'blue',
    'question_access': 'green',
    'subscription_upgrade': 'purple',
    'practice_session': 'orange',
    'error_book_add': 'red',
    'statistics_view': 'indigo',
    'profile_update': 'gray',
    'login': 'teal',
    'logout': 'pink'
  }
  return actionColors[action] || 'gray'
}