import { NextRequest, NextResponse } from 'next/server'
import { getAccessToken, PAYPAL_API_BASE, generateRequestId } from '@/config/paypalConfig'

export async function POST(request: NextRequest) {
  try {
    // 检查PayPal是否配置
    if (!process.env.PAYPAL_CLIENT_ID || !process.env.PAYPAL_CLIENT_SECRET) {
      return NextResponse.json(
        { error: 'PayPal未配置', message: 'PayPal支付功能暂未启用' },
        { status: 503 }
      )
    }

    const { name, description, type = 'SERVICE', category = 'SOFTWARE' } = await request.json()

    // 获取访问令牌
    const accessToken = await getAccessToken()

    // 创建产品
    const response = await fetch(`${PAYPAL_API_BASE}/v1/catalogs/products`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
        'PayPal-Request-Id': generateRequestId(),
        'Prefer': 'return=representation'
      },
      body: JSON.stringify({
        name,
        description,
        type,
        category,
        image_url: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/logo-128.png`,
        home_url: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
      })
    })

    if (!response.ok) {
      const errorData = await response.text()
      console.error('PayPal产品创建失败:', errorData)
      return NextResponse.json(
        { error: 'PayPal产品创建失败', details: errorData },
        { status: response.status }
      )
    }

    const productData = await response.json()
    
    return NextResponse.json({
      success: true,
      product: productData
    })

  } catch (error) {
    console.error('创建PayPal产品时出错:', error)
    return NextResponse.json(
      { error: '服务器内部错误', details: error instanceof Error ? error.message : '未知错误' },
      { status: 500 }
    )
  }
}