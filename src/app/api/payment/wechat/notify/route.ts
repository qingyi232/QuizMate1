import { NextRequest, NextResponse } from 'next/server'
import { DOMESTIC_PAYMENT_CONFIG } from '@/config/domesticPayment'
import { createClient } from '@/lib/db/supabase-server'
import crypto from 'crypto'

// 微信支付签名验证
function verifyWechatSign(params: Record<string, any>, apiKey: string): boolean {
  const sign = params.sign
  delete params.sign
  
  const sortedKeys = Object.keys(params).sort()
  const stringA = sortedKeys
    .filter(key => params[key] !== '')
    .map(key => `${key}=${params[key]}`)
    .join('&')
  const stringSignTemp = `${stringA}&key=${apiKey}`
  const calculatedSign = crypto.createHash('md5').update(stringSignTemp, 'utf8').digest('hex').toUpperCase()
  
  return calculatedSign === sign
}

// XML转对象
function parseXML(xml: string): Record<string, any> {
  const result: Record<string, any> = {}
  const regex = /<(\w+)><!\[CDATA\[(.*?)\]\]><\/\w+>|<(\w+)>(.*?)<\/\w+>/g
  let match
  while ((match = regex.exec(xml)) !== null) {
    const key = match[1] || match[3]
    const value = match[2] || match[4]
    result[key] = value
  }
  return result
}

// 构建XML响应
function buildXMLResponse(returnCode: string, returnMsg: string): string {
  return `<xml>
    <return_code><![CDATA[${returnCode}]]></return_code>
    <return_msg><![CDATA[${returnMsg}]]></return_msg>
  </xml>`
}

export async function POST(req: NextRequest) {
  try {
    const xmlData = await req.text()
    const params = parseXML(xmlData)

    // 验证签名
    const signVerified = verifyWechatSign(params, DOMESTIC_PAYMENT_CONFIG.wechatPay.apiKey)
    
    if (!signVerified) {
      console.error('微信支付回调签名验证失败')
      return new Response(buildXMLResponse('FAIL', '签名验证失败'), {
        headers: { 'Content-Type': 'application/xml' }
      })
    }

    // 检查支付结果
    if (params.return_code !== 'SUCCESS' || params.result_code !== 'SUCCESS') {
      console.error('微信支付失败:', params)
      return new Response(buildXMLResponse('FAIL', '支付失败'), {
        headers: { 'Content-Type': 'application/xml' }
      })
    }

    const {
      out_trade_no: orderId,
      transaction_id: transactionId,
      total_fee: totalFee,
      time_end: timeEnd,
      attach
    } = params

    // 解析附加参数
    const metadata = attach ? JSON.parse(attach) : {}
    
    const supabase = createClient()
    
    // 更新订单状态
    const { error: orderError } = await supabase
      .from('payment_orders')
      .update({
        status: 'paid',
        paid_at: timeEnd ? new Date(
          `${timeEnd.slice(0, 4)}-${timeEnd.slice(4, 6)}-${timeEnd.slice(6, 8)} ${timeEnd.slice(8, 10)}:${timeEnd.slice(10, 12)}:${timeEnd.slice(12, 14)}`
        ).toISOString() : new Date().toISOString(),
        transaction_id: transactionId,
        metadata: {
          ...metadata,
          wechat_response: params
        }
      })
      .eq('id', orderId)

    if (orderError) {
      console.error('订单状态更新失败:', orderError)
      return new Response(buildXMLResponse('FAIL', '订单更新失败'), {
        headers: { 'Content-Type': 'application/xml' }
      })
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
          payment_method: 'wechat',
          amount: parseInt(totalFee), // 微信支付金额单位已经是分
          currency: 'CNY',
          status: 'completed',
          transaction_id: transactionId,
          created_at: new Date().toISOString(),
          metadata: params
        })
    }

    return new Response(buildXMLResponse('SUCCESS', 'OK'), {
      headers: { 'Content-Type': 'application/xml' }
    })

  } catch (error) {
    console.error('微信支付回调处理失败:', error)
    return new Response(buildXMLResponse('FAIL', '处理失败'), {
      headers: { 'Content-Type': 'application/xml' }
    })
  }
}