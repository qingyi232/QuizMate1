# 🔧 环境变量配置指南

## 必需的环境变量

在Vercel部署时，需要配置以下环境变量：

### 🔐 Supabase配置（必需）
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here
```

### 🤖 AI配置（必需）
```
SILICON_FLOW_API_KEY=your_silicon_flow_api_key_here
```

### 📱 SMS配置（手机登录功能需要）
```
ALIBABA_ACCESS_KEY_ID=your_alibaba_access_key_id_here
ALIBABA_ACCESS_KEY_SECRET=your_alibaba_access_key_secret_here
ALIBABA_SMS_SIGN_NAME=your_sms_sign_name_here
ALIBABA_SMS_TEMPLATE_CODE=your_sms_template_code_here
```

### 🔑 JWT密钥（必需）
```
JWT_SECRET=your_random_jwt_secret_here
```

### 💳 PayPal配置（可选）
```
PAYPAL_CLIENT_ID=your_paypal_client_id_here
PAYPAL_CLIENT_SECRET=your_paypal_client_secret_here
```

### 📧 邮件配置（联系表单需要）
```
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_gmail_address_here
SMTP_PASS=your_gmail_app_password_here
SMTP_FROM=noreply@quizmate.com
```

## 🚀 在Vercel中配置

1. 登录Vercel控制台
2. 进入您的项目设置
3. 点击 "Environment Variables"
4. 逐一添加上述环境变量

## ⚠️ 重要提示

- 如果不配置Supabase，网站将在演示模式下运行
- 如果不配置SMS，手机登录功能将被禁用
- 如果不配置PayPal，支付功能将被禁用
- 所有功能都有优雅降级处理
