import { NextRequest, NextResponse } from 'next/server'
import { DOMESTIC_PAYMENT_CONFIG } from '@/config/domesticPayment'
import { createClient } from '@/lib/db/supabase-server'
import crypto from 'crypto'
import axios from 'axios'

// 生成6位数字验证码
function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

// 阿里云短信签名生成
function generateAliyunSignature(params: Record<string, any>, accessKeySecret: string): string {
  const sortedKeys = Object.keys(params).sort()
  const canonicalizedQueryString = sortedKeys
    .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
    .join('&')
  
  const stringToSign = `GET&${encodeURIComponent('/')}&${encodeURIComponent(canonicalizedQueryString)}`
  const hmac = crypto.createHmac('sha1', accessKeySecret + '&')
  return hmac.update(stringToSign).digest('base64')
}

// 检查是否为演示模式
function isDemo(): boolean {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  return !supabaseUrl || supabaseUrl.includes('placeholder') || !supabaseKey || supabaseKey.includes('placeholder')
}

export async function POST(req: NextRequest) {
  try {
    const { phone } = await req.json()
    
    // 验证手机号格式
    const phoneRegex = /^1[3-9]\d{9}$/
    if (!phone || !phoneRegex.test(phone)) {
      return NextResponse.json(
        { error: '请输入有效的手机号码' },
        { status: 400 }
      )
    }

    // 生成验证码
    const code = generateVerificationCode()
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000) // 5分钟后过期

    // 演示模式：直接返回成功，不需要数据库
    if (isDemo()) {
      console.log(`演示模式短信验证码: ${phone} -> ${code}`)
      return NextResponse.json({
        success: true,
        message: '验证码发送成功',
        devCode: code // 演示模式下返回验证码
      })
    }

    // 真实模式：检查数据库和发送短信
    const supabase = await createClient()
    
    // 检查是否频繁发送
    try {
      const { data: recentSms } = await supabase
        .from('sms_codes')
        .select('*')
        .eq('phone', phone)
        .gte('created_at', new Date(Date.now() - 60000).toISOString()) // 1分钟内
        .single()

      if (recentSms) {
        return NextResponse.json(
          { error: '请稍后再试，验证码发送过于频繁' },
          { status: 429 }
        )
      }
    } catch (dbError) {
      // 数据库查询失败，记录错误但继续执行
      console.warn('数据库查询失败，跳过频率检查:', dbError)
    }

    // 在开发环境下，直接返回验证码，不发送短信
    if (process.env.NODE_ENV === 'development') {
      console.log(`开发环境短信验证码: ${phone} -> ${code}`)
      
      // 尝试保存验证码到数据库
      try {
        const dbClient = await createClient()
        await dbClient
          .from('sms_codes')
          .insert({
            phone,
            code,
            expires_at: expiresAt.toISOString(),
            used: false,
            created_at: new Date().toISOString()
          })
      } catch (dbError) {
        console.warn('数据库保存失败，但验证码已生成:', dbError)
      }

      return NextResponse.json({
        success: true,
        message: '验证码发送成功',
        devCode: code // 开发环境下返回验证码
      })
    }

    // 生产环境发送真实短信
    try {
      const timestamp = new Date().toISOString()
      const nonce = Math.random().toString(36).substr(2, 15)
      
      const smsParams = {
        SignatureMethod: 'HMAC-SHA1',
        SignatureNonce: nonce,
        AccessKeyId: DOMESTIC_PAYMENT_CONFIG.sms.accessKeyId,
        SignatureVersion: '1.0',
        Timestamp: timestamp,
        Format: 'JSON',
        Action: 'SendSms',
        Version: '2017-05-25',
        RegionId: 'cn-hangzhou',
        PhoneNumbers: phone,
        SignName: DOMESTIC_PAYMENT_CONFIG.sms.signName,
        TemplateCode: DOMESTIC_PAYMENT_CONFIG.sms.templateCode,
        TemplateParam: JSON.stringify({ code })
      }

      smsParams.Signature = generateAliyunSignature(smsParams, DOMESTIC_PAYMENT_CONFIG.sms.accessKeySecret)

      await axios.get(DOMESTIC_PAYMENT_CONFIG.sms.endpoint, {
        params: smsParams
      })

      // 保存验证码到数据库
      const prodClient = await createClient()
      await prodClient
        .from('sms_codes')
        .insert({
          phone,
          code,
          expires_at: expiresAt.toISOString(),
          used: false,
          created_at: new Date().toISOString()
        })

      return NextResponse.json({
        success: true,
        message: '验证码发送成功'
      })

    } catch (smsError) {
      console.error('短信发送失败:', smsError)
      return NextResponse.json(
        { error: '验证码发送失败，请稍后重试' },
        { status: 500 }
      )
    }

  } catch (error) {
    console.error('短信发送接口错误:', error)
    return NextResponse.json(
      { error: '服务器错误' },
      { status: 500 }
    )
  }
}