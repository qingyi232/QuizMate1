# 🚀 QuizMate 完整功能设置指南

## 📋 概览

QuizMate 现在支持以下完整功能：
- ✅ **现代化UI** - 专业的学习平台界面
- 🤖 **真实AI解析** - OpenAI GPT-4o-mini 驱动
- 👤 **用户认证系统** - Supabase Auth
- 📚 **题库管理** - 创建、浏览、搜索题目
- 🔄 **闪卡复习** - 智能间隔重复学习
- 💳 **订阅付费** - Stripe 集成
- 📊 **学习统计** - PostHog 分析

## 🛠️ 快速设置（5分钟）

### 第一步：自动设置向导

```bash
# 运行设置向导
node setup-wizard.js
```

向导将引导您配置：
- Supabase 数据库
- OpenAI API 密钥  
- 可选服务（Stripe、PostHog）

### 第二步：初始化数据库

```bash
# 安装依赖
npm install

# 设置数据库表结构
npm run db:setup
```

### 第三步：启动应用

```bash
# 启动开发服务器
npm run dev
```

🎉 访问 http://localhost:3000 开始使用！

---

## 🔧 详细配置指南

### 1. Supabase 数据库设置

1. **创建项目**
   - 访问 https://app.supabase.com
   - 点击 "New Project"
   - 选择组织和数据库密码

2. **获取密钥**
   ```bash
   # 在 Project Settings > API 中找到：
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   ```

3. **运行数据库脚本**
   ```bash
   # 自动执行所有SQL脚本
   node scripts/db-setup.js
   
   # 或手动在Supabase SQL Editor中运行：
   # 1. sql/001_initial_schema.sql
   # 2. sql/002_rls_policies.sql  
   # 3. sql/003_functions.sql
   ```

### 2. OpenAI API 配置

1. **获取API密钥**
   - 访问 https://platform.openai.com/api-keys
   - 创建新的API密钥

2. **配置环境变量**
   ```bash
   OPENAI_API_KEY=sk-your-openai-key
   AI_PROVIDER=openai
   MODEL_FREE=gpt-4o-mini
   MODEL_PAID=gpt-4o-mini
   ```

### 3. Stripe 支付设置（可选）

1. **创建Stripe账户**
   - 访问 https://stripe.com
   - 完成商户设置

2. **配置环境变量**
   ```bash
   STRIPE_SECRET_KEY=sk_test_your-stripe-key
   STRIPE_PUBLISHABLE_KEY=pk_test_your-stripe-key
   STRIPE_WEBHOOK_SECRET=whsec_your-webhook-secret
   ```

3. **设置Webhook**
   - Stripe Dashboard > Webhooks
   - 添加端点：`https://yourdomain.com/api/stripe-webhook`
   - 选择事件：`checkout.session.completed`, `invoice.payment_succeeded`

### 4. PostHog 分析设置（可选）

```bash
NEXT_PUBLIC_POSTHOG_KEY=phc_your-posthog-key
NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com
```

---

## 📱 核心功能使用

### 🤖 AI题目解析

1. **创建题目**
   - 访问 `/quiz` 
   - 粘贴或上传题目文本
   - 选择学科、年级、语言
   - 点击"生成解析"

2. **AI解析结果**
   - 标准答案
   - 详细解释
   - 自动生成闪卡
   - 置信度评分

### 📚 题库管理

1. **浏览题库**
   - 访问 `/questions`
   - 按学科、年级、语言筛选
   - 搜索题目内容

2. **我的题目**
   - 切换"只显示我的题目"
   - 查看解析状态
   - 管理闪卡

### 🎯 闪卡复习

1. **智能复习**
   - 间隔重复算法
   - 难度自适应
   - 学习统计追踪

2. **复习模式**
   - 单题复习
   - 批量复习
   - 考试模式

### 👤 用户系统

1. **注册登录**
   - 邮箱注册
   - Google OAuth
   - 自动profile创建

2. **订阅管理**
   - 免费版：5次/天
   - Pro版：无限次 + 高级功能

---

## 🎯 测试功能

### 基础功能测试

```bash
# 1. 访问首页
curl http://localhost:3000

# 2. 测试题库API
curl http://localhost:3000/api/questions

# 3. 测试AI解析（需要登录）
curl -X POST http://localhost:3000/api/generate \
  -H "Content-Type: application/json" \
  -d '{"text":"What is 2+2?","meta":{"language":"en"}}'
```

### 示例题目测试

```javascript
// 数学题
{
  "text": "Solve: 2x + 5 = 17. Show your steps.",
  "meta": {
    "subject": "Mathematics",
    "grade": "Middle School",
    "language": "en"
  }
}

// 选择题
{
  "text": "Which gas is most responsible for the greenhouse effect?\nA) Oxygen\nB) Nitrogen\nC) Carbon dioxide\nD) Argon",
  "meta": {
    "subject": "Environmental Science", 
    "grade": "High School",
    "language": "en"
  }
}

// 中文题目
{
  "text": "判断题：地球是太阳系中最大的行星。",
  "meta": {
    "subject": "Geography",
    "grade": "Elementary", 
    "language": "zh-CN"
  }
}
```

---

## 🚨 常见问题

### Q: AI解析不工作？
**A:** 检查以下配置：
1. `OPENAI_API_KEY` 是否正确
2. 网络连接是否正常
3. API配额是否足够

### Q: 认证错误？
**A:** 确认：
1. Supabase URL 和密钥正确
2. 数据库表已创建
3. RLS策略已启用

### Q: 题库为空？
**A:** 运行示例数据：
```bash
node scripts/db-setup.js
```

### Q: 支付功能报错？
**A:** 检查：
1. Stripe密钥配置
2. Webhook端点设置
3. 产品和价格ID

---

## 🔄 开发工作流

### 本地开发
```bash
npm run dev          # 启动开发服务器
npm run build        # 构建生产版本  
npm run test         # 运行测试
npm run db:reset     # 重置数据库
```

### 部署到生产
```bash
# Vercel部署
vercel --prod

# 环境变量迁移
cp .env.local .env.production
```

### 数据库维护
```bash
# 备份数据
npm run db:backup

# 迁移数据  
npm run db:migrate

# 查看日志
npm run logs
```

---

## 🎉 完成！

现在您已经拥有一个功能完整的AI学习平台：

- ✅ **现代化界面** - 专业的用户体验
- ✅ **智能解析** - GPT-4o-mini驱动的AI
- ✅ **完整认证** - 注册、登录、权限管理
- ✅ **题库系统** - 创建、管理、搜索题目
- ✅ **学习工具** - 闪卡、复习、统计
- ✅ **商业模式** - 免费版 + 付费订阅

**下一步：**
- 部署到 Vercel
- 配置自定义域名
- 开始获取用户反馈
- 迭代优化功能

🚀 **QuizMate 已准备好改变学习方式！**