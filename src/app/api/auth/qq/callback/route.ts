import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/db/supabase-server'
import { getQQAccessToken, getQQOpenID, getQQUserInfo } from '../route'

/**
 * QQ OAuth回调处理
 * GET /api/auth/qq/callback
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get('code')
    const state = searchParams.get('state')

    if (!code) {
      return NextResponse.redirect(
        new URL('/auth/register?error=qq_auth_failed', request.url)
      )
    }

    // 解析state参数
    let redirectTo = '/dashboard'
    try {
      if (state) {
        const stateData = JSON.parse(Buffer.from(state, 'base64url').toString())
        redirectTo = stateData.redirect_to || '/dashboard'
      }
    } catch (error) {
      console.warn('Invalid state parameter:', error)
    }

    // 获取QQ访问令牌
    const tokenData = await getQQAccessToken(code)
    
    if (!tokenData.access_token) {
      console.error('QQ token error:', tokenData)
      return NextResponse.redirect(
        new URL('/auth/register?error=qq_token_failed', request.url)
      )
    }

    // 获取QQ OpenID
    const openidData = await getQQOpenID(tokenData.access_token)
    
    if (openidData.error) {
      console.error('QQ openid error:', openidData)
      return NextResponse.redirect(
        new URL(`/auth/register?error=qq_openid_failed&message=${encodeURIComponent(openidData.error_description)}`, request.url)
      )
    }

    // 获取QQ用户信息
    const userInfo = await getQQUserInfo(tokenData.access_token, openidData.openid)
    
    if (userInfo.ret !== 0) {
      console.error('QQ userinfo error:', userInfo)
      return NextResponse.redirect(
        new URL(`/auth/register?error=qq_userinfo_failed&message=${encodeURIComponent(userInfo.msg)}`, request.url)
      )
    }

    // 处理用户登录/注册
    const supabase = createClient()
    
    // 查找现有用户
    const { data: existingUser, error: findError } = await supabase
      .from('users')
      .select('*')
      .eq('provider_id', openidData.openid)
      .eq('provider', 'qq')
      .single()

    let userId: string

    if (existingUser) {
      // 现有用户，更新信息
      userId = existingUser.id
      
      const { error: updateError } = await supabase
        .from('users')
        .update({
          nickname: userInfo.nickname,
          avatar_url: userInfo.figureurl_qq_1 || userInfo.figureurl_1,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)

      if (updateError) {
        console.error('Error updating QQ user:', updateError)
      }
    } else {
      // 新用户，创建账户
      const { data: newUser, error: createError } = await supabase
        .from('users')
        .insert({
          email: `qq_${openidData.openid}@quizmate.com`,
          nickname: userInfo.nickname,
          avatar_url: userInfo.figureurl_qq_1 || userInfo.figureurl_1,
          provider: 'qq',
          provider_id: openidData.openid,
          email_confirmed_at: new Date().toISOString(),
          user_metadata: {
            qq_info: {
              openid: openidData.openid,
              nickname: userInfo.nickname,
              gender: userInfo.gender,
              province: userInfo.province,
              city: userInfo.city,
              year: userInfo.year,
              figureurl: userInfo.figureurl,
              figureurl_1: userInfo.figureurl_1,
              figureurl_2: userInfo.figureurl_2,
              figureurl_qq_1: userInfo.figureurl_qq_1,
              figureurl_qq_2: userInfo.figureurl_qq_2,
              is_lost: userInfo.is_lost,
              vip: userInfo.vip,
              level: userInfo.level
            }
          }
        })
        .select()
        .single()

      if (createError || !newUser) {
        console.error('Error creating QQ user:', createError)
        return NextResponse.redirect(
          new URL('/auth/register?error=qq_create_failed', request.url)
        )
      }

      userId = newUser.id
    }

    // 创建会话
    const { data: session, error: sessionError } = await supabase.auth.admin.generateLink({
      type: 'magiclink',
      email: `qq_${openidData.openid}@quizmate.com`,
      options: {
        redirectTo: `${new URL(request.url).origin}${redirectTo}`
      }
    })

    if (sessionError || !session) {
      console.error('Error creating session:', sessionError)
      return NextResponse.redirect(
        new URL('/auth/register?error=session_failed', request.url)
      )
    }

    // 重定向到目标页面，附带会话信息
    const response = NextResponse.redirect(new URL(redirectTo, request.url))
    
    // 设置认证cookie
    if (session.properties?.action_link) {
      const url = new URL(session.properties.action_link)
      const token = url.searchParams.get('token')
      if (token) {
        response.cookies.set('sb-access-token', token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 60 * 60 * 24 * 7 // 7天
        })
      }
    }

    return response

  } catch (error) {
    console.error('QQ OAuth callback error:', error)
    return NextResponse.redirect(
      new URL('/auth/register?error=qq_callback_failed', request.url)
    )
  }
}
