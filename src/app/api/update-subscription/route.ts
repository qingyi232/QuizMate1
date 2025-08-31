import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Supabase URL and key are required')
}

const supabase = createClient(supabaseUrl, supabaseKey)

export async function POST(request: NextRequest) {
  try {
    const {
      sessionId,
      customerId,
      subscriptionId,
      plan,
      email
    } = await request.json()

    if (!sessionId || !customerId || !email) {
      return NextResponse.json(
        { error: '缺少必要参数' },
        { status: 400 }
      )
    }

    // 查找或创建用户
    let { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single()

    if (userError && userError.code === 'PGRST116') {
      // 用户不存在，创建新用户
      const { data: newUser, error: createError } = await supabase
        .from('users')
        .insert({
          email: email,
          subscription_status: 'active',
          subscription_plan: plan || 'pro',
          stripe_customer_id: customerId,
          stripe_subscription_id: subscriptionId,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single()

      if (createError) {
        console.error('创建用户失败:', createError)
        return NextResponse.json(
          { error: '创建用户失败' },
          { status: 500 }
        )
      }
      user = newUser
    } else if (userError) {
      console.error('查询用户失败:', userError)
      return NextResponse.json(
        { error: '查询用户失败' },
        { status: 500 }
      )
    } else {
      // 用户存在，更新订阅信息
      const { error: updateError } = await supabase
        .from('users')
        .update({
          subscription_status: 'active',
          subscription_plan: plan || 'pro',
          stripe_customer_id: customerId,
          stripe_subscription_id: subscriptionId,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)

      if (updateError) {
        console.error('更新用户订阅失败:', updateError)
        return NextResponse.json(
          { error: '更新用户订阅失败' },
          { status: 500 }
        )
      }
    }

    // 记录支付事务
    await supabase
      .from('payment_transactions')
      .insert({
        user_id: user.id,
        stripe_session_id: sessionId,
        stripe_customer_id: customerId,
        stripe_subscription_id: subscriptionId,
        plan: plan || 'pro',
        amount: plan === 'pro' ? 499 : 1999, // cents
        currency: 'usd',
        status: 'completed',
        created_at: new Date().toISOString()
      })

    // 记录用户活动
    await supabase
      .from('user_activities')
      .insert({
        user_id: user.id,
        action: 'subscription_upgrade',
        details: {
          plan: plan || 'pro',
          sessionId: sessionId
        },
        created_at: new Date().toISOString()
      })

    return NextResponse.json({
      success: true,
      message: '订阅状态更新成功',
      user: {
        id: user.id,
        email: user.email,
        subscription_plan: plan || 'pro',
        subscription_status: 'active'
      }
    })

  } catch (error) {
    console.error('更新订阅状态失败:', error)
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    )
  }
}