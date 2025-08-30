import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getAccessToken, PAYPAL_API_BASE } from '@/config/paypalConfig'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    // 检查PayPal是否配置
    if (!process.env.PAYPAL_CLIENT_ID || !process.env.PAYPAL_CLIENT_SECRET) {
      return NextResponse.json(
        { error: 'PayPal未配置', message: 'PayPal支付功能暂未启用' },
        { status: 503 }
      )
    }
    const { subscriptionId, planId } = await request.json()

    // 获取当前用户（这里需要根据你的认证系统调整）
    const authHeader = request.headers.get('authorization')
    if (!authHeader) {
      return NextResponse.json(
        { error: '需要登录' },
        { status: 401 }
      )
    }

    // 从PayPal获取订阅详情
    const accessToken = await getAccessToken()
    const subscriptionResponse = await fetch(
      `${PAYPAL_API_BASE}/v1/billing/subscriptions/${subscriptionId}`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      }
    )

    if (!subscriptionResponse.ok) {
      throw new Error('获取PayPal订阅信息失败')
    }

    const subscriptionData = await subscriptionResponse.json()

    // 这里你需要根据实际的用户认证系统获取用户ID
    // 示例：假设从JWT token或session中获取用户ID
    const userId = 'user-id-from-auth' // 替换为实际的用户ID获取逻辑

    // 保存订阅信息到数据库
    const { data, error } = await supabase
      .from('paypal_subscriptions')
      .insert({
        user_id: userId,
        subscription_id: subscriptionId,
        plan_id: planId,
        status: subscriptionData.status,
        subscription_data: subscriptionData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })

    if (error) {
      console.error('保存订阅信息到数据库失败:', error)
      return NextResponse.json(
        { error: '保存订阅信息失败', details: error.message },
        { status: 500 }
      )
    }

    // 更新用户的订阅状态
    const { error: profileError } = await supabase
      .from('profiles')
      .update({
        plan: 'pro_monthly', // 或根据planId确定计划类型
        subscription_status: 'active',
        paypal_subscription_id: subscriptionId,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)

    if (profileError) {
      console.error('更新用户资料失败:', profileError)
    }

    return NextResponse.json({
      success: true,
      subscriptionId,
      status: subscriptionData.status
    })

  } catch (error) {
    console.error('保存PayPal订阅时出错:', error)
    return NextResponse.json(
      { error: '服务器内部错误', details: error instanceof Error ? error.message : '未知错误' },
      { status: 500 }
    )
  }
}