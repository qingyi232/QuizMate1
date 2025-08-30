import { NextRequest, NextResponse } from 'next/server'
import AlipaySdk from 'alipay-sdk'
import { DOMESTIC_PAYMENT_CONFIG } from '@/config/domesticPayment'
import { createClient } from '@/lib/db/supabase-server'

const alipaySdk = new AlipaySdk({
  appId: DOMESTIC_PAYMENT_CONFIG.alipay.appId,
  privateKey: DOMESTIC_PAYMENT_CONFIG.alipay.privateKey,
  alipayPublicKey: DOMESTIC_PAYMENT_CONFIG.alipay.publicKey,
  gateway: DOMESTIC_PAYMENT_CONFIG.alipay.gateway,
})

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const params: Record<string, string> = {}
    
    // 将FormData转换为对象
    for (const [key, value] of formData.entries()) {
      params[key] = value as string
    }

    // 验证签名
    const signVerified = alipaySdk.checkNotifySign(params)
    
    if (!signVerified) {
      console.error('支付宝回调签名验证失败')
      return new Response('fail')
    }

    const {
      out_trade_no: orderId,
      trade_status: tradeStatus,
      total_amount: totalAmount,
      buyer_email: buyerEmail,
      gmt_payment: paymentTime,
      passback_params: passbackParams
    } = params

    // 解析回传参数
    const metadata = passbackParams ? JSON.parse(decodeURIComponent(passbackParams)) : {}
    
    const supabase = createClient()
    
    // 更新订单状态
    if (tradeStatus === 'TRADE_SUCCESS' || tradeStatus === 'TRADE_FINISHED') {
      // 更新订单为已支付
      const { error: orderError } = await supabase
        .from('payment_orders')
        .update({
          status: 'paid',
          paid_at: paymentTime || new Date().toISOString(),
          transaction_id: params.trade_no,
          metadata: {
            ...metadata,
            alipay_response: params
          }
        })
        .eq('id', orderId)

      if (orderError) {
        console.error('订单状态更新失败:', orderError)
        return new Response('fail')
      }

      // 更新用户订阅状态
      if (metadata.userId && metadata.plan) {
        const { error: profileError } = await supabase
          .from('profiles')
          .update({
            plan: metadata.plan === 'pro_monthly' ? 'pro' : 'pro',
            subscription_status: 'active',
            subscription_end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30天后过期
          })
          .eq('id', metadata.userId)

        if (profileError) {
          console.error('用户订阅状态更新失败:', profileError)
        }

        // 记录支付交易
        await supabase
          .from('payment_transactions')
          .insert({
            user_id: metadata.userId,
            order_id: orderId,
            payment_method: 'alipay',
            amount: parseFloat(totalAmount) * 100, // 转换为分
            currency: 'CNY',
            status: 'completed',
            transaction_id: params.trade_no,
            created_at: new Date().toISOString(),
            metadata: params
          })
      }
    }

    return new Response('success')

  } catch (error) {
    console.error('支付宝回调处理失败:', error)
    return new Response('fail')
  }
}