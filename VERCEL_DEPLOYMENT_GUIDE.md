# 🚀 QuizMate Vercel 部署指南

## 📋 **部署前检查清单**

### ✅ **已完成的功能**
- [x] 核心题库和练习功能
- [x] AI智能解析
- [x] 用户认证（邮箱/Google）
- [x] Stripe国际支付
- [x] 响应式UI设计
- [x] 数据库配置（Supabase）

### ⚠️ **临时禁用的功能**
- [ ] 手机号登录（数据库连接问题）
- [ ] PayPal支付（SDK配置问题）
- [ ] 微信/QQ登录（需要OAuth配置）

## 🚀 **立即部署步骤**

### 1️⃣ **准备GitHub仓库**

```bash
# 如果还没有Git仓库
git init
git add .
git commit -m "Initial QuizMate deployment"

# 推送到GitHub
git remote add origin https://github.com/你的用户名/QuizMate.git
git branch -M main
git push -u origin main
```

### 2️⃣ **部署到Vercel**

1. **访问 Vercel**
   - 前往: https://vercel.com
   - 使用GitHub账号登录

2. **导入项目**
   - 点击 "New Project"
   - 选择你的QuizMate仓库
   - 点击 "Import"

3. **配置环境变量**

在Vercel项目设置中添加以下环境变量：

#### **必需的环境变量**
```bash
# Supabase配置
NEXT_PUBLIC_SUPABASE_URL=https://whxukfuqzmbmapaksriz.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=你的_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY=你的_SERVICE_ROLE_KEY

# AI配置
OPENAI_API_KEY=你的_OPENAI_API_KEY
AI_PROVIDER=openai

# JWT配置
JWT_SECRET=你的_JWT_SECRET

# 应用配置
APP_BASE_URL=https://你的域名.vercel.app
NEXT_PUBLIC_SITE_URL=https://你的域名.vercel.app
```

#### **Stripe支付配置**
```bash
STRIPE_SECRET_KEY=你的_STRIPE_SECRET_KEY
STRIPE_PUBLISHABLE_KEY=你的_STRIPE_PUBLISHABLE_KEY
STRIPE_WEBHOOK_SECRET=你的_WEBHOOK_SECRET
STRIPE_PRICE_ID_MONTHLY=你的_PRICE_ID
```

#### **可选配置（后续添加）**
```bash
# 短信服务（阿里云）
ALIYUN_SMS_ACCESS_KEY_ID=待配置
ALIYUN_SMS_ACCESS_KEY_SECRET=待配置
ALIYUN_SMS_SIGN_NAME=QuizMate
ALIYUN_SMS_TEMPLATE_CODE=待配置

# PayPal支付
PAYPAL_CLIENT_ID=待配置
PAYPAL_CLIENT_SECRET=待配置

# 微信/QQ登录
WECHAT_APP_ID=待配置
WECHAT_APP_SECRET=待配置
QQ_APP_ID=待配置
QQ_APP_KEY=待配置
```

### 3️⃣ **部署**

1. **配置完环境变量后**
   - 点击 "Deploy"
   - 等待构建完成（约2-5分钟）

2. **获取域名**
   - 部署成功后获得 `https://你的项目名.vercel.app` 域名
   - 可以在设置中配置自定义域名

### 4️⃣ **配置Stripe Webhook**

1. **登录Stripe Dashboard**
2. **添加Webhook端点**
   ```
   URL: https://你的域名.vercel.app/api/stripe/webhook
   Events: checkout.session.completed, invoice.payment_succeeded
   ```
3. **更新环境变量**
   - 将Webhook Secret添加到Vercel环境变量

## 📊 **部署后功能状态**

| 功能 | 状态 | 说明 |
|------|------|------|
| 🎯 题库练习 | ✅ 完全可用 | 核心功能 |
| 🤖 AI解析 | ✅ 完全可用 | 需要OpenAI Key |
| 🔐 邮箱登录 | ✅ 完全可用 | Supabase Auth |
| 🌐 Google登录 | ✅ 完全可用 | OAuth配置 |
| 💳 Stripe支付 | ✅ 完全可用 | 国际用户 |
| 📱 手机号登录 | ❌ 临时禁用 | 待修复 |
| 💰 PayPal支付 | ❌ 临时禁用 | 待配置 |
| 💬 微信/QQ登录 | ❌ 需要配置 | 国内用户 |

## 🔧 **部署后配置**

### **1. 配置自定义域名（可选）**
```bash
# 在Vercel项目设置中
Domains -> Add Domain -> 输入你的域名
```

### **2. 配置CDN和缓存**
Vercel自动配置，无需额外设置

### **3. 监控和分析**
- Vercel Analytics（免费）
- 错误监控已集成Sentry

## 🎯 **部署后测试清单**

### **立即测试**
- [ ] 网站首页加载
- [ ] 用户注册/登录
- [ ] 题库浏览
- [ ] AI解析功能
- [ ] Stripe支付流程

### **后续完善**
- [ ] 修复手机号登录
- [ ] 配置PayPal支付
- [ ] 启用微信/QQ登录
- [ ] 配置真实短信服务

## 🆘 **常见问题**

### **构建失败**
```bash
# 检查package.json中的构建脚本
npm run build

# 检查TypeScript错误
npm run type-check
```

### **环境变量问题**
- 确保所有必需的环境变量都已配置
- 注意变量名的大小写
- 重新部署以应用新的环境变量

### **数据库连接问题**
- 检查Supabase URL和Key是否正确
- 确保数据库表已创建
- 检查RLS策略设置

## 🎉 **成功部署！**

你的QuizMate现在已经上线！

**访问地址**: https://你的项目名.vercel.app

**管理后台**: https://vercel.com/dashboard

**下一步**: 
1. 测试所有功能
2. 配置自定义域名
3. 完善剩余功能
4. 推广你的应用！

---

*本指南最后更新: 2025年1月*
