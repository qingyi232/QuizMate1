import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

// 安全初始化Stripe
const stripeSecretKey = process.env.STRIPE_SECRET_KEY
let stripe: Stripe | null = null

if (stripeSecretKey && stripeSecretKey !== 'sk_test_placeholder') {
  stripe = new Stripe(stripeSecretKey, {
    apiVersion: '2024-06-20',
  })
}

export async function POST(request: NextRequest) {
  try {
    // 检查Stripe是否可用
    if (!stripe) {
      return NextResponse.json(
        { error: 'Stripe未配置' },
        { status: 503 }
      )
    }
    
    const { plan, email, paymentMethod } = await request.json()

    // 验证输入
    if (!plan || !email) {
      return NextResponse.json(
        { error: '缺少必要参数' },
        { status: 400 }
      )
    }

    // 定义套餐配置
    const planConfig = {
      pro: {
        name: 'QuizMate Pro 高级版',
        amount: 499, // $4.99 in cents
        currency: 'usd',
        interval: 'month',
        description: '无限次AI解析，完整题库访问，SmartRouter多模型等高级功能'
      }
    }

    const selectedPlan = planConfig[plan as keyof typeof planConfig]
    if (!selectedPlan) {
      return NextResponse.json(
        { error: '无效的套餐选择' },
        { status: 400 }
      )
    }

    // 根据支付方式创建不同的支付会话
    if (paymentMethod === 'stripe') {
      // Stripe信用卡支付
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        customer_email: email,
        line_items: [
          {
            price_data: {
              currency: selectedPlan.currency,
              product_data: {
                name: selectedPlan.name,
                description: selectedPlan.description,
              },
              unit_amount: selectedPlan.amount,
              recurring: {
                interval: selectedPlan.interval,
              },
            },
            quantity: 1,
          },
        ],
        mode: 'subscription',
        success_url: `${request.nextUrl.origin}/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${request.nextUrl.origin}/pricing`,
        metadata: {
          plan: plan,
          email: email,
        },
        subscription_data: {
          metadata: {
            plan: plan,
            email: email,
          },
        },
      })

      return NextResponse.json({ sessionId: session.id })

    } else if (paymentMethod === 'alipay') {
      // 支付宝支付
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['alipay'],
        customer_email: email,
        line_items: [
          {
            price_data: {
              currency: 'usd', // 支付宝也可以支持USD
              product_data: {
                name: selectedPlan.name,
                description: selectedPlan.description,
              },
              unit_amount: selectedPlan.amount,
              recurring: {
                interval: selectedPlan.interval,
              },
            },
            quantity: 1,
          },
        ],
        mode: 'subscription',
        success_url: `${request.nextUrl.origin}/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${request.nextUrl.origin}/pricing`,
        metadata: {
          plan: plan,
          email: email,
          paymentMethod: 'alipay',
        },
      })

      return NextResponse.json({ sessionId: session.id })

    } else if (paymentMethod === 'wechat') {
      // 微信支付 (通过第三方支付网关)
      // 这里可以集成其他支付提供商如PayPal, Square等
      // 目前返回一个模拟的支付URL
      const mockPaymentUrl = `${request.nextUrl.origin}/wechat-pay?plan=${plan}&email=${encodeURIComponent(email)}&amount=${selectedPlan.amount}`
      
      return NextResponse.json({ 
        paymentUrl: mockPaymentUrl,
        message: '微信支付功能正在开发中，请选择其他支付方式' 
      })
    }

    return NextResponse.json(
      { error: '不支持的支付方式' },
      { status: 400 }
    )

  } catch (error) {
    console.error('创建支付会话失败:', error)
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    )
  }
}