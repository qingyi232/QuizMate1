import { NextRequest, NextResponse } from 'next/server'
import { DOMESTIC_PAYMENT_CONFIG, PlanType } from '@/config/domesticPayment'
import { createClient } from '@/lib/db/supabase-server'
import { getCurrentUser } from '@/lib/auth/auth'
import { nanoid } from 'nanoid'
// crypto will be imported dynamically
import axios from 'axios'

// 微信支付签名函数
function generateWechatSign(params: Record<string, any>, apiKey: string): string {
  const sortedKeys = Object.keys(params).sort()
  const stringA = sortedKeys
    .filter(key => params[key] !== '' && key !== 'sign')
    .map(key => `${key}=${params[key]}`)
    .join('&')
  const stringSignTemp = `${stringA}&key=${apiKey}`
  return crypto.createHash('md5').update(stringSignTemp, 'utf8').digest('hex').toUpperCase()
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

// 对象转XML
function buildXML(obj: Record<string, any>): string {
  let xml = '<xml>'
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'number') {
      xml += `<${key}>${value}</${key}>`
    } else {
      xml += `<${key}><![CDATA[${value}]]></${key}>`
    }
  }
  xml += '</xml>'
  return xml
}

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
    const orderId = `wechat_${nanoid(16)}`
    const amount = DOMESTIC_PAYMENT_CONFIG.pricing.pro.monthly // 当前只支持月付
    
    // 准备微信支付参数
    const params = {
      appid: DOMESTIC_PAYMENT_CONFIG.wechatPay.appId,
      mch_id: DOMESTIC_PAYMENT_CONFIG.wechatPay.mchId,
      nonce_str: nanoid(32),
      body: DOMESTIC_PAYMENT_CONFIG.pricing.pro.title,
      out_trade_no: orderId,
      total_fee: amount, // 微信支付金额单位为分
      spbill_create_ip: '127.0.0.1', // 实际应该获取用户IP
      notify_url: `${process.env.NEXT_PUBLIC_BASE_URL}/api/payment/wechat/notify`,
      trade_type: 'NATIVE', // 扫码支付
      attach: JSON.stringify({ userId: user.id, plan })
    }

    // 生成签名
    params.sign = generateWechatSign(params, DOMESTIC_PAYMENT_CONFIG.wechatPay.apiKey)

    // 调用微信统一下单接口
    const response = await axios.post(
      'https://api.mch.weixin.qq.com/pay/unifiedorder',
      buildXML(params),
      {
        headers: {
          'Content-Type': 'application/xml'
        }
      }
    )

    const result = parseXML(response.data)
    
    if (result.return_code !== 'SUCCESS' || result.result_code !== 'SUCCESS') {
      console.error('微信支付下单失败:', result)
      return NextResponse.json(
        { error: '微信支付下单失败' },
        { status: 500 }
      )
    }

    // 保存订单到数据库
    const supabase = createClient()
    const { error: dbError } = await supabase
      .from('payment_orders')
      .insert({
        id: orderId,
        user_id: user.id,
        plan_type: plan,
        payment_method: 'wechat',
        amount: amount,
        currency: 'CNY',
        status: 'pending',
        created_at: new Date().toISOString(),
        metadata: {
          prepay_id: result.prepay_id,
          code_url: result.code_url
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
      codeUrl: result.code_url, // 用于生成二维码
      amount: (amount / 100).toFixed(2),
      currency: 'CNY'
    })

  } catch (error) {
    console.error('微信支付订单创建失败:', error)
    return NextResponse.json(
      { error: '支付订单创建失败' },
      { status: 500 }
    )
  }
}