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
    const { 
      productId, 
      planName, 
      planDescription,
      price,
      currency = 'USD',
      intervalUnit = 'MONTH',
      intervalCount = 1,
      totalCycles = 12,
      setupFee = null,
      trialPeriod = null
    } = await request.json()

    // 获取访问令牌
    const accessToken = await getAccessToken()

    // 构建计费周期
    const billingCycles = []

    // 如果有试用期，添加试用周期
    if (trialPeriod) {
      billingCycles.push({
        frequency: {
          interval_unit: trialPeriod.intervalUnit || 'MONTH',
          interval_count: trialPeriod.intervalCount || 1
        },
        tenure_type: 'TRIAL',
        sequence: 1,
        total_cycles: trialPeriod.totalCycles || 1
      })
    }

    // 添加常规计费周期
    billingCycles.push({
      frequency: {
        interval_unit: intervalUnit,
        interval_count: intervalCount
      },
      tenure_type: 'REGULAR',
      sequence: trialPeriod ? 2 : 1,
      total_cycles: totalCycles,
      pricing_scheme: {
        fixed_price: {
          value: price.toString(),
          currency_code: currency
        }
      }
    })

    // 构建支付偏好设置
    const paymentPreferences: any = {
      auto_bill_outstanding: true,
      payment_failure_threshold: 3
    }

    // 如果有设置费用，添加设置费用
    if (setupFee) {
      paymentPreferences.setup_fee = {
        value: setupFee.toString(),
        currency_code: currency
      }
      paymentPreferences.setup_fee_failure_action = 'CONTINUE'
    }

    // 创建订阅计划
    const response = await fetch(`${PAYPAL_API_BASE}/v1/billing/plans`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
        'PayPal-Request-Id': generateRequestId(),
        'Prefer': 'return=representation'
      },
      body: JSON.stringify({
        product_id: productId,
        name: planName,
        description: planDescription,
        status: 'ACTIVE',
        billing_cycles: billingCycles,
        payment_preferences: paymentPreferences,
        taxes: {
          percentage: '0',
          inclusive: false
        }
      })
    })

    if (!response.ok) {
      const errorData = await response.text()
      console.error('PayPal订阅计划创建失败:', errorData)
      return NextResponse.json(
        { error: 'PayPal订阅计划创建失败', details: errorData },
        { status: response.status }
      )
    }

    const planData = await response.json()
    
    return NextResponse.json({
      success: true,
      plan: planData
    })

  } catch (error) {
    console.error('创建PayPal订阅计划时出错:', error)
    return NextResponse.json(
      { error: '服务器内部错误', details: error instanceof Error ? error.message : '未知错误' },
      { status: 500 }
    )
  }
}