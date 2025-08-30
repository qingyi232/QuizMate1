import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

// 微信开放平台配置
const WECHAT_CONFIG = {
  appId: process.env.WECHAT_APP_ID,
  appSecret: process.env.WECHAT_APP_SECRET,
  redirectUri: process.env.WECHAT_REDIRECT_URI || `${process.env.NEXTAUTH_URL}/api/auth/wechat/callback`
}

// 请求参数验证
const wechatAuthSchema = z.object({
  redirect_to: z.string().optional()
})

/**
 * 微信OAuth登录 - 发起授权
 * GET /api/auth/wechat
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const redirect_to = searchParams.get('redirect_to') || '/dashboard'

    // 检查配置
    if (!WECHAT_CONFIG.appId || !WECHAT_CONFIG.appSecret) {
      return NextResponse.json(
        { error: 'WeChat OAuth not configured' },
        { status: 500 }
      )
    }

    // 生成state参数（用于防止CSRF攻击）
    const state = Buffer.from(JSON.stringify({
      redirect_to,
      timestamp: Date.now(),
      random: Math.random().toString(36).substr(2, 9)
    })).toString('base64url')

    // 构建微信授权URL
    const authUrl = new URL('https://open.weixin.qq.com/connect/qrconnect')
    authUrl.searchParams.set('appid', WECHAT_CONFIG.appId)
    authUrl.searchParams.set('redirect_uri', WECHAT_CONFIG.redirectUri!)
    authUrl.searchParams.set('response_type', 'code')
    authUrl.searchParams.set('scope', 'snsapi_login')
    authUrl.searchParams.set('state', state)

    // 重定向到微信授权页面
    return NextResponse.redirect(authUrl.toString())

  } catch (error) {
    console.error('WeChat OAuth initiation error:', error)
    return NextResponse.json(
      { error: 'Failed to initiate WeChat OAuth' },
      { status: 500 }
    )
  }
}

/**
 * 获取微信用户信息
 */
async function getWeChatUserInfo(accessToken: string, openid: string) {
  const response = await fetch(
    `https://api.weixin.qq.com/sns/userinfo?access_token=${accessToken}&openid=${openid}&lang=zh_CN`
  )
  
  if (!response.ok) {
    throw new Error('Failed to get WeChat user info')
  }

  return response.json()
}

/**
 * 获取微信访问令牌
 */
async function getWeChatAccessToken(code: string) {
  const tokenUrl = new URL('https://api.weixin.qq.com/sns/oauth2/access_token')
  tokenUrl.searchParams.set('appid', WECHAT_CONFIG.appId!)
  tokenUrl.searchParams.set('secret', WECHAT_CONFIG.appSecret!)
  tokenUrl.searchParams.set('code', code)
  tokenUrl.searchParams.set('grant_type', 'authorization_code')

  const response = await fetch(tokenUrl.toString())
  
  if (!response.ok) {
    throw new Error('Failed to get WeChat access token')
  }

  return response.json()
}

export { getWeChatAccessToken, getWeChatUserInfo }
