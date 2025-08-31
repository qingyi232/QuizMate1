import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Supabase URL and key are required')
}

const supabase = createClient(supabaseUrl, supabaseKey)

// 用户权限类型定义
export interface UserPermissions {
  plan: 'free' | 'pro' | 'enterprise'
  status: 'free' | 'active' | 'canceled' | 'expired'
  features: string[]
  limits: {
    dailyAI: number // -1 表示无限制
    dailyQuestions: number // -1 表示无限制
  }
  usage: {
    dailyAI: number
    dailyQuestions: number
  }
}

// 权限检查结果
export interface PermissionResult {
  allowed: boolean
  reason?: string
  upgradeRequired?: boolean
}

// 获取用户权限信息
export async function getUserPermissions(email: string): Promise<UserPermissions | null> {
  try {
    // 首先重置每日使用限额（如果需要）
    await resetDailyUsageIfNeeded()

    // 获取用户信息
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single()

    if (userError || !user) {
      return null
    }

    // 获取套餐限制
    const { data: limits, error: limitsError } = await supabase
      .from('usage_limits')
      .select('*')
      .eq('plan', user.subscription_plan)
      .single()

    if (limitsError || !limits) {
      return null
    }

    return {
      plan: user.subscription_plan,
      status: user.subscription_status,
      features: limits.features || [],
      limits: {
        dailyAI: limits.daily_ai_limit,
        dailyQuestions: limits.daily_questions_limit
      },
      usage: {
        dailyAI: user.daily_ai_usage || 0,
        dailyQuestions: user.daily_questions_accessed || 0
      }
    }
  } catch (error) {
    console.error('获取用户权限失败:', error)
    return null
  }
}

// 检查用户是否有权限执行某个操作
export async function checkUserPermission(
  email: string, 
  action: string
): Promise<PermissionResult> {
  const permissions = await getUserPermissions(email)
  
  if (!permissions) {
    return {
      allowed: false,
      reason: '用户不存在或权限获取失败',
      upgradeRequired: false
    }
  }

  // 检查订阅状态
  if (permissions.status === 'expired' || permissions.status === 'canceled') {
    return {
      allowed: false,
      reason: '订阅已过期或已取消',
      upgradeRequired: true
    }
  }

  // 检查具体权限
  switch (action) {
    case 'ai_analysis':
      // 检查AI解析权限
      if (permissions.limits.dailyAI > 0 && permissions.usage.dailyAI >= permissions.limits.dailyAI) {
        return {
          allowed: false,
          reason: `每日AI解析次数已用完（${permissions.limits.dailyAI}次）`,
          upgradeRequired: permissions.plan === 'free'
        }
      }
      return { allowed: true }

    case 'question_access':
      // 检查题库访问权限
      if (permissions.limits.dailyQuestions > 0 && permissions.usage.dailyQuestions >= permissions.limits.dailyQuestions) {
        return {
          allowed: false,
          reason: `每日题库访问次数已用完（${permissions.limits.dailyQuestions}次）`,
          upgradeRequired: permissions.plan === 'free'
        }
      }
      return { allowed: true }

    case 'smart_router':
      // SmartRouter多模型功能
      if (!permissions.features.includes('smart_router')) {
        return {
          allowed: false,
          reason: 'SmartRouter功能需要Pro版本',
          upgradeRequired: true
        }
      }
      return { allowed: true }

    case 'advanced_ocr':
      // 高级OCR功能
      if (!permissions.features.includes('advanced_ocr')) {
        return {
          allowed: false,
          reason: '高级OCR功能需要Pro版本',
          upgradeRequired: true
        }
      }
      return { allowed: true }

    case 'full_question_bank':
      // 完整题库访问
      if (!permissions.features.includes('full_question_bank')) {
        return {
          allowed: false,
          reason: '完整题库访问需要Pro版本',
          upgradeRequired: true
        }
      }
      return { allowed: true }

    case 'statistics':
      // 学习统计
      if (!permissions.features.includes('statistics')) {
        return {
          allowed: false,
          reason: '学习统计功能需要Pro版本',
          upgradeRequired: true
        }
      }
      return { allowed: true }

    case 'api_access':
      // API访问权限
      if (!permissions.features.includes('api_access')) {
        return {
          allowed: false,
          reason: 'API访问需要企业版',
          upgradeRequired: true
        }
      }
      return { allowed: true }

    default:
      // 检查功能是否在用户的权限列表中
      if (!permissions.features.includes(action)) {
        return {
          allowed: false,
          reason: '该功能需要更高级别的套餐',
          upgradeRequired: true
        }
      }
      return { allowed: true }
  }
}

// 记录用户使用行为
export async function recordUsage(email: string, action: string, details?: any) {
  try {
    // 获取用户ID
    const { data: user } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single()

    if (!user) return

    // 更新使用统计
    if (action === 'ai_analysis') {
      await supabase
        .from('users')
        .update({
          daily_ai_usage: supabase.rpc('increment_daily_ai_usage', { user_email: email }),
          updated_at: new Date().toISOString()
        })
        .eq('email', email)
    } else if (action === 'question_access') {
      await supabase
        .from('users')
        .update({
          daily_questions_accessed: supabase.rpc('increment_daily_questions', { user_email: email }),
          updated_at: new Date().toISOString()
        })
        .eq('email', email)
    }

    // 记录活动日志
    await supabase
      .from('user_activities')
      .insert({
        user_id: user.id,
        action: action,
        details: details || {},
        created_at: new Date().toISOString()
      })

  } catch (error) {
    console.error('记录用户使用行为失败:', error)
  }
}

// 重置每日使用限额（如果需要）
async function resetDailyUsageIfNeeded() {
  try {
    await supabase.rpc('reset_daily_usage')
  } catch (error) {
    console.error('重置每日使用限额失败:', error)
  }
}

// 升级用户订阅
export async function upgradeUserSubscription(
  email: string, 
  plan: 'pro' | 'enterprise',
  stripeCustomerId?: string,
  stripeSubscriptionId?: string
) {
  try {
    await supabase
      .from('users')
      .update({
        subscription_plan: plan,
        subscription_status: 'active',
        stripe_customer_id: stripeCustomerId,
        stripe_subscription_id: stripeSubscriptionId,
        subscription_start_date: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('email', email)

    // 记录升级活动
    await recordUsage(email, 'subscription_upgrade', { plan })

    return { success: true }
  } catch (error) {
    console.error('升级用户订阅失败:', error)
    return { success: false, error: error.message }
  }
}

// 获取用户活动日志
export async function getUserActivities(email: string, limit: number = 50) {
  try {
    const { data, error } = await supabase
      .from('user_activities')
      .select(`
        id,
        action,
        details,
        created_at,
        users!inner(email)
      `)
      .eq('users.email', email)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) throw error
    return data
  } catch (error) {
    console.error('获取用户活动日志失败:', error)
    return []
  }
}