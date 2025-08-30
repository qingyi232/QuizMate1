// PayPal配置
const isProduction = process.env.NODE_ENV === 'production'

// 检查PayPal是否配置
const isPayPalConfigured = Boolean(
  process.env.PAYPAL_CLIENT_ID && 
  process.env.PAYPAL_CLIENT_SECRET
)

// 暂时禁用PayPal SDK，使用REST API
export const paypalClient = isPayPalConfigured ? {
  // PayPal客户端配置
  clientId: process.env.PAYPAL_CLIENT_ID!,
  clientSecret: process.env.PAYPAL_CLIENT_SECRET!,
  environment: isProduction ? 'live' : 'sandbox'
} : null

// 获取访问令牌
export async function getAccessToken(): Promise<string> {
  try {
    const response = await fetch(
      `https://api-m.${isProduction ? '' : 'sandbox.'}paypal.com/v1/oauth2/token`,
      {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Accept-Language': 'en_US',
          'Authorization': `Basic ${Buffer.from(
            `${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`
          ).toString('base64')}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: 'grant_type=client_credentials'
      }
    )

    const data = await response.json()
    return data.access_token
  } catch (error) {
    console.error('获取PayPal访问令牌失败:', error)
    throw error
  }
}

// API基础URL
export const PAYPAL_API_BASE = isProduction 
  ? 'https://api-m.paypal.com' 
  : 'https://api-m.sandbox.paypal.com'

// 生成唯一请求ID（用于防止重复请求）
export function generateRequestId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2)}`
}