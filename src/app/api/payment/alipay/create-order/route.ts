import { NextRequest, NextResponse } from 'next/server'
import AlipaySdk from 'alipay-sdk'
import { DOMESTIC_PAYMENT_CONFIG, PlanType } from '@/config/domesticPayment'
import { createClient } from '@/lib/db/supabase-server'
import { getCurrentUser } from '@/lib/auth/auth'
import { nanoid } from 'nanoid'

const alipaySdk = new AlipaySdk({
  appId: DOMESTIC_PAYMENT_CONFIG.alipay.appId,
  privateKey: DOMESTIC_PAYMENT_CONFIG.alipay.privateKey,
  alipayPublicKey: DOMESTIC_PAYMENT_CONFIG.alipay.publicKey,
  gateway: DOMESTIC_PAYMENT_CONFIG.alipay.gateway,
  timeout: 5000,
  camelCase: true,
})

export async function POST(req: NextRequest) {
  try {
    // 获取当前用户
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json(
        { error: '用户未登录' },
        { status: 401 }
      )
    }

    const { plan } = await req.json()
    
    if (!plan || !Object.values(PlanType).includes(plan)) {
      return NextResponse.json(
        { error: '无效的订阅计划' },
        { status: 400 }
      )
    }

    // 生成订单号
    const orderId = `alipay_${nanoid(16)}`
    const amount = DOMESTIC_PAYMENT_CONFIG.pricing.pro.monthly // 当前只支持月付
    
    // 创建支付宝订单
    const formData = new AlipaySdk.AlipayFormData()
    formData.setMethod('get')
    formData.addField('bizContent', {
      outTradeNo: orderId,
      productCode: 'FAST_INSTANT_TRADE_PAY',
      totalAmount: (amount / 100).toFixed(2), // 转换为元
      subject: DOMESTIC_PAYMENT_CONFIG.pricing.pro.title,
      body: DOMESTIC_PAYMENT_CONFIG.pricing.pro.description,
      quitUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/payment/cancelled`,
      passbackParams: JSON.stringify({ userId: user.id, plan })
    })
    formData.addField('returnUrl', `${process.env.NEXT_PUBLIC_BASE_URL}${DOMESTIC_PAYMENT_CONFIG.alipay.returnUrl}`)
    
    const result = await alipaySdk.exec('alipay.trade.page.pay', {}, formData)
    
    // 保存订单到数据库
    const supabase = createClient()
    const { error: dbError } = await supabase
      .from('payment_orders')
      .insert({
        id: orderId,
        user_id: user.id,
        plan_type: plan,
        payment_method: 'alipay',
        amount: amount,
        currency: 'CNY',
        status: 'pending',
        created_at: new Date().toISOString(),
        metadata: {
          alipay_form: result
        }
      })

    if (dbError) {
      console.error('订单保存失败:', dbError)
      return NextResponse.json(
        { error: '订单创建失败' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      orderId,
      paymentUrl: result,
      amount: (amount / 100).toFixed(2),
      currency: 'CNY'
    })

  } catch (error) {
    console.error('支付宝订单创建失败:', error)
    return NextResponse.json(
      { error: '支付订单创建失败' },
      { status: 500 }
    )
  }
}