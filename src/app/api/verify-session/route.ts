import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
})

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const sessionId = searchParams.get('session_id')

    if (!sessionId) {
      return NextResponse.json(
        { error: '缺少session_id参数' },
        { status: 400 }
      )
    }

    // 从Stripe获取支付会话详情
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['subscription', 'customer']
    })

    if (session.payment_status === 'paid') {
      return NextResponse.json({
        success: true,
        session: {
          id: session.id,
          customer: session.customer,
          customer_email: session.customer_email,
          subscription: session.subscription,
          amount_total: session.amount_total,
          currency: session.currency,
          payment_status: session.payment_status,
          metadata: session.metadata
        }
      })
    } else {
      return NextResponse.json(
        { error: '支付未完成', payment_status: session.payment_status },
        { status: 400 }
      )
    }

  } catch (error) {
    console.error('验证支付会话失败:', error)
    return NextResponse.json(
      { error: '验证支付失败' },
      { status: 500 }
    )
  }
}