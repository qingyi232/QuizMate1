import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/db/supabase-server'
import jwt from 'jsonwebtoken'
import { nanoid } from 'nanoid'

// 检查是否为演示模式
function isDemo(): boolean {
  const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  return !supabaseUrl || supabaseUrl.includes('placeholder') || !supabaseKey || supabaseKey.includes('placeholder')
}

export async function POST(req: NextRequest) {
  try {
    const { phone, code } = await req.json()
    
    // 验证手机号格式
    const phoneRegex = /^1[3-9]\d{9}$/
    if (!phone || !phoneRegex.test(phone)) {
      return NextResponse.json(
        { error: '请输入有效的手机号码' },
        { status: 400 }
      )
    }

    // 验证验证码格式
    if (!code || !/^\d{6}$/.test(code)) {
      return NextResponse.json(
        { error: '请输入6位数字验证码' },
        { status: 400 }
      )
    }

    // 演示模式：简化验证和登录
    if (isDemo()) {
      console.log(`演示模式手机号登录: ${phone} -> ${code}`)
      
      // 演示模式下接受任何6位数字验证码
      const userId = `demo-phone-${phone}`
      const demoUser = {
        id: userId,
        phone: phone,
        display_name: `手机用户${phone.slice(-4)}`,
        email: `${phone}@demo.com`,
        provider: 'phone'
      }

      // 生成演示JWT Token
      const token = jwt.sign(
        {
          sub: demoUser.id,
          phone: demoUser.phone,
          iat: Math.floor(Date.now() / 1000),
          exp: Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60) // 7天过期
        },
        process.env.JWT_SECRET || 'demo-jwt-secret'
      )

      // 设置Cookie
      const response = NextResponse.json({
        success: true,
        message: '登录成功（演示模式）',
        user: demoUser
      })

      response.cookies.set('auth-token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 // 7天
      })

      return response
    }

    // 真实模式：完整验证流程
    const supabase = createServiceClient()
    
    // 验证短信验证码
    const { data: smsCode, error: smsError } = await supabase
      .from('sms_codes')
      .select('*')
      .eq('phone', phone)
      .eq('code', code)
      .eq('used', false)
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (smsError || !smsCode) {
      return NextResponse.json(
        { error: '验证码无效或已过期' },
        { status: 400 }
      )
    }

    // 标记验证码为已使用
    await supabase
      .from('sms_codes')
      .update({ used: true })
      .eq('id', smsCode.id)

    // 查找现有用户资料
    let userProfile
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('*')
      .eq('phone', phone)
      .single()

    if (existingProfile) {
      userProfile = existingProfile
    } else {
      // 使用 Supabase Auth API 创建新用户
      const email = `${phone}@phone.login`
      const password = nanoid(16) // 随机密码
      
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: email,
        password: password,
        email_confirm: true,
        user_metadata: {
          phone: phone,
          display_name: `用户${phone.slice(-4)}`
        }
      })

      if (authError || !authData.user) {
        console.error('用户创建失败:', authError)
        return NextResponse.json(
          { error: '账户创建失败' },
          { status: 500 }
        )
      }

      // 创建用户资料
      const { data: newProfile, error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: authData.user.id,
          phone: phone,
          display_name: `用户${phone.slice(-4)}`,
          plan: 'free',
          subscription_status: 'inactive',
          created_at: new Date().toISOString()
        })
        .select()
        .single()

      if (profileError || !newProfile) {
        console.error('用户资料创建失败:', profileError)
        return NextResponse.json(
          { error: '用户资料创建失败' },
          { status: 500 }
        )
      }

      userProfile = newProfile
    }

    // 生成JWT Token
    const token = jwt.sign(
      {
        sub: userProfile.id,
        phone: userProfile.phone,
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60) // 7天过期
      },
      process.env.JWT_SECRET || 'your-jwt-secret'
    )

    // 记录登录活动（忽略数据库错误）
    try {
      await supabase
        .from('user_activities')
        .insert({
          user_email: `${phone}@phone.login`,
          activity_type: 'phone_login',
          details: {
            phone: phone,
            login_method: 'sms'
          },
          created_at: new Date().toISOString()
        })
    } catch (activityError) {
      console.warn('记录登录活动失败:', activityError)
    }

    // 设置Cookie
    const response = NextResponse.json({
      success: true,
      message: '登录成功',
      user: {
        id: userProfile.id,
        phone: userProfile.phone,
        display_name: userProfile.display_name || `用户${phone.slice(-4)}`
      }
    })

    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 // 7天
    })

    return response

  } catch (error) {
    console.error('手机号登录失败:', error)
    return NextResponse.json(
      { error: '登录失败，请稍后重试' },
      { status: 500 }
    )
  }
}