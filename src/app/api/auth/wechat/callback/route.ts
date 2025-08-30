import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/db/supabase-server'
import { getWeChatAccessToken, getWeChatUserInfo } from '../route'

/**
 * 微信OAuth回调处理
 * GET /api/auth/wechat/callback
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get('code')
    const state = searchParams.get('state')

    if (!code) {
      return NextResponse.redirect(
        new URL('/auth/register?error=wechat_auth_failed', request.url)
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

    // 获取微信访问令牌
    const tokenData = await getWeChatAccessToken(code)
    
    if (tokenData.errcode) {
      console.error('WeChat token error:', tokenData)
      return NextResponse.redirect(
        new URL(`/auth/register?error=wechat_token_failed&message=${encodeURIComponent(tokenData.errmsg)}`, request.url)
      )
    }

    // 获取微信用户信息
    const userInfo = await getWeChatUserInfo(tokenData.access_token, tokenData.openid)
    
    if (userInfo.errcode) {
      console.error('WeChat userinfo error:', userInfo)
      return NextResponse.redirect(
        new URL(`/auth/register?error=wechat_userinfo_failed&message=${encodeURIComponent(userInfo.errmsg)}`, request.url)
      )
    }

    // 处理用户登录/注册
    const supabase = createClient()
    
    // 查找现有用户
    const { data: existingUser, error: findError } = await supabase
      .from('users')
      .select('*')
      .eq('provider_id', userInfo.openid)
      .eq('provider', 'wechat')
      .single()

    let userId: string

    if (existingUser) {
      // 现有用户，更新信息
      userId = existingUser.id
      
      const { error: updateError } = await supabase
        .from('users')
        .update({
          nickname: userInfo.nickname,
          avatar_url: userInfo.headimgurl,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)

      if (updateError) {
        console.error('Error updating WeChat user:', updateError)
      }
    } else {
      // 新用户，创建账户
      const { data: newUser, error: createError } = await supabase
        .from('users')
        .insert({
          email: `wechat_${userInfo.openid}@quizmate.com`,
          nickname: userInfo.nickname,
          avatar_url: userInfo.headimgurl,
          provider: 'wechat',
          provider_id: userInfo.openid,
          email_confirmed_at: new Date().toISOString(),
          user_metadata: {
            wechat_info: {
              openid: userInfo.openid,
              unionid: userInfo.unionid,
              nickname: userInfo.nickname,
              sex: userInfo.sex,
              province: userInfo.province,
              city: userInfo.city,
              country: userInfo.country,
              headimgurl: userInfo.headimgurl
            }
          }
        })
        .select()
        .single()

      if (createError || !newUser) {
        console.error('Error creating WeChat user:', createError)
        return NextResponse.redirect(
          new URL('/auth/register?error=wechat_create_failed', request.url)
        )
      }

      userId = newUser.id
    }

    // 创建会话
    const { data: session, error: sessionError } = await supabase.auth.admin.generateLink({
      type: 'magiclink',
      email: `wechat_${userInfo.openid}@quizmate.com`,
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
    console.error('WeChat OAuth callback error:', error)
    return NextResponse.redirect(
      new URL('/auth/register?error=wechat_callback_failed', request.url)
    )
  }
}
