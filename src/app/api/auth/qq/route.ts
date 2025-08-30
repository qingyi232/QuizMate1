import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

// QQ互联配置
const QQ_CONFIG = {
  appId: process.env.QQ_APP_ID,
  appKey: process.env.QQ_APP_KEY,
  redirectUri: process.env.QQ_REDIRECT_URI || `${process.env.NEXTAUTH_URL}/api/auth/qq/callback`
}

// 请求参数验证
const qqAuthSchema = z.object({
  redirect_to: z.string().optional()
})

/**
 * QQ OAuth登录 - 发起授权
 * GET /api/auth/qq
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const redirect_to = searchParams.get('redirect_to') || '/dashboard'

    // 检查配置
    if (!QQ_CONFIG.appId || !QQ_CONFIG.appKey) {
      return NextResponse.json(
        { error: 'QQ OAuth not configured' },
        { status: 500 }
      )
    }

    // 生成state参数（用于防止CSRF攻击）
    const state = Buffer.from(JSON.stringify({
      redirect_to,
      timestamp: Date.now(),
      random: Math.random().toString(36).substr(2, 9)
    })).toString('base64url')

    // 构建QQ授权URL
    const authUrl = new URL('https://graph.qq.com/oauth2.0/authorize')
    authUrl.searchParams.set('client_id', QQ_CONFIG.appId)
    authUrl.searchParams.set('redirect_uri', QQ_CONFIG.redirectUri!)
    authUrl.searchParams.set('response_type', 'code')
    authUrl.searchParams.set('scope', 'get_user_info')
    authUrl.searchParams.set('state', state)

    // 重定向到QQ授权页面
    return NextResponse.redirect(authUrl.toString())

  } catch (error) {
    console.error('QQ OAuth initiation error:', error)
    return NextResponse.json(
      { error: 'Failed to initiate QQ OAuth' },
      { status: 500 }
    )
  }
}

/**
 * 获取QQ用户信息
 */
async function getQQUserInfo(accessToken: string, openid: string) {
  const response = await fetch(
    `https://graph.qq.com/user/get_user_info?access_token=${accessToken}&oauth_consumer_key=${QQ_CONFIG.appId}&openid=${openid}`
  )
  
  if (!response.ok) {
    throw new Error('Failed to get QQ user info')
  }

  return response.json()
}

/**
 * 获取QQ OpenID
 */
async function getQQOpenID(accessToken: string) {
  const response = await fetch(
    `https://graph.qq.com/oauth2.0/me?access_token=${accessToken}`
  )
  
  if (!response.ok) {
    throw new Error('Failed to get QQ OpenID')
  }

  const text = await response.text()
  // QQ返回的是JSONP格式，需要解析
  const match = text.match(/callback\(\s*({.*})\s*\)/)
  if (!match) {
    throw new Error('Invalid QQ OpenID response')
  }

  return JSON.parse(match[1])
}

/**
 * 获取QQ访问令牌
 */
async function getQQAccessToken(code: string) {
  const tokenUrl = new URL('https://graph.qq.com/oauth2.0/token')
  tokenUrl.searchParams.set('client_id', QQ_CONFIG.appId!)
  tokenUrl.searchParams.set('client_secret', QQ_CONFIG.appKey!)
  tokenUrl.searchParams.set('code', code)
  tokenUrl.searchParams.set('grant_type', 'authorization_code')
  tokenUrl.searchParams.set('redirect_uri', QQ_CONFIG.redirectUri!)

  const response = await fetch(tokenUrl.toString())
  
  if (!response.ok) {
    throw new Error('Failed to get QQ access token')
  }

  const text = await response.text()
  
  // QQ返回的是query string格式，需要解析
  const params = new URLSearchParams(text)
  const accessToken = params.get('access_token')
  const expiresIn = params.get('expires_in')
  const refreshToken = params.get('refresh_token')

  if (!accessToken) {
    throw new Error('No access token in QQ response')
  }

  return {
    access_token: accessToken,
    expires_in: expiresIn,
    refresh_token: refreshToken
  }
}

export { getQQAccessToken, getQQOpenID, getQQUserInfo }
