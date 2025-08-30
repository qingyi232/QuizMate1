import { NextRequest, NextResponse } from 'next/server'
import nodemailer from 'nodemailer'

export async function POST(request: NextRequest) {
  try {
    const { name, email, category, subject, message } = await request.json()

    // 验证必填字段
    if (!name || !email || !category || !subject || !message) {
      return NextResponse.json(
        { error: '请填写所有必填字段' },
        { status: 400 }
      )
    }

    // 验证邮箱格式
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: '请输入有效的邮箱地址' },
        { status: 400 }
      )
    }

    // 创建邮件传输器
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    })

    // 邮件内容
    const mailOptions = {
      from: process.env.SMTP_USER, // 必须使用认证用户的邮箱
      to: process.env.CONTACT_EMAIL || 'shenqingyi16@gmail.com',
      subject: `QuizMate联系表单 - ${category}: ${subject}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">QuizMate 联系表单</h2>
          
          <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #374151; margin-top: 0;">联系信息</h3>
            <p><strong>姓名:</strong> ${name}</p>
            <p><strong>邮箱:</strong> ${email}</p>
            <p><strong>问题类型:</strong> ${category}</p>
            <p><strong>主题:</strong> ${subject}</p>
          </div>

          <div style="background: #ffffff; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
            <h3 style="color: #374151; margin-top: 0;">详细描述</h3>
            <p style="white-space: pre-wrap; line-height: 1.6;">${message}</p>
          </div>

          <div style="margin-top: 20px; padding: 15px; background: #eff6ff; border-radius: 8px; font-size: 12px; color: #6b7280;">
            <p>此邮件由QuizMate联系表单自动发送</p>
            <p>发送时间: ${new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' })}</p>
          </div>
        </div>
      `,
      // 同时发送给用户确认邮件
      replyTo: email
    }

    // 发送邮件
    await transporter.sendMail(mailOptions)

    // 发送确认邮件给用户
    const confirmationMail = {
      from: process.env.SMTP_USER || 'shenqingyi16@gmail.com',
      to: email,
      subject: 'QuizMate - 您的消息已收到',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #2563eb 0%, #059669 100%); padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 24px;">感谢您的联系！</h1>
          </div>
          
          <div style="background: white; padding: 30px; border-radius: 0 0 8px 8px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
            <p>亲爱的 <strong>${name}</strong>，</p>
            
            <p>感谢您联系QuizMate！我们已经收到您的消息，我们会在24小时内回复您。</p>
            
            <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #374151; margin-top: 0;">您提交的信息</h3>
              <p><strong>问题类型:</strong> ${category}</p>
              <p><strong>主题:</strong> ${subject}</p>
              <p><strong>提交时间:</strong> ${new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' })}</p>
            </div>

            <p>如果您有紧急问题，也可以直接回复此邮件或联系：</p>
            <ul>
              <li>邮箱: shenqingyi16@gmail.com</li>
              <li>QQ: 3123155744@qq.com</li>
            </ul>

            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center; color: #6b7280; font-size: 14px;">
              <p>QuizMate - 您的AI学习助手</p>
              <p>让学习变得更简单</p>
            </div>
          </div>
        </div>
      `
    }

    await transporter.sendMail(confirmationMail)

    return NextResponse.json({ 
      message: '消息发送成功！我们会在24小时内回复您。',
      success: true 
    })

  } catch (error: any) {
    console.error('邮件发送失败:', error)
    return NextResponse.json(
      { error: '消息发送失败，请稍后重试或直接发送邮件至 shenqingyi16@gmail.com' },
      { status: 500 }
    )
  }
}