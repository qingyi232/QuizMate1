# QuizMate 部署指南

## 🚀 完整商业化系统部署

您的 QuizMate 应用现已集成完整的商业化功能，包括：

- ✅ **分级定价系统** - 免费版、Pro版、企业版
- ✅ **Stripe支付集成** - 信用卡、支付宝、微信支付
- ✅ **权限管理系统** - 精确控制功能访问
- ✅ **用户活动追踪** - 完整的操作日志记录
- ✅ **法律合规文档** - 服务条款和隐私政策

## 📋 部署前准备

### 1. 环境变量配置

创建 `.env.local` 文件并添加以下环境变量：

```bash
# 数据库配置
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Stripe支付配置
STRIPE_SECRET_KEY=sk_live_xxxx  # 生产环境使用 sk_live_
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_xxxx  # 生产环境使用 pk_live_

# AI服务配置
OPENAI_API_KEY=your_openai_api_key
ANTHROPIC_API_KEY=your_anthropic_api_key
SILICONFLOW_API_KEY=your_siliconflow_api_key

# 其他配置
NEXT_PUBLIC_SITE_URL=https://yoursite.com
```

### 2. 数据库设置

在 Supabase 中执行以下SQL脚本来创建所有必要的表：

#### 2.1 创建用户权限表
```bash
# 在项目根目录运行
supabase db push --file user-subscription-schema.sql
```

#### 2.2 创建题库表
```bash
# 创建多学科题库
supabase db push --file simple-create-tables.sql
```

#### 2.3 导入样本数据
```bash
# 运行快速测试脚本导入题目
node quick-test.js
```

### 3. Stripe配置

#### 3.1 创建产品和价格
在 Stripe Dashboard 中创建以下产品：

1. **Pro 高级版**
   - 价格：$4.99/月
   - 价格ID：记录用于代码中

2. **企业版**
   - 价格：$19.99/月
   - 价格ID：记录用于代码中

#### 3.2 配置 Webhook
设置 Webhook 端点：`https://yoursite.com/api/stripe-webhook`

监听以下事件：
- `customer.subscription.created`
- `customer.subscription.updated`
- `customer.subscription.deleted`
- `invoice.payment_succeeded`
- `invoice.payment_failed`

### 4. 部署步骤

#### 4.1 Vercel 部署
```bash
# 安装 Vercel CLI
npm install -g vercel

# 部署
vercel --prod

# 设置环境变量
vercel env add STRIPE_SECRET_KEY
vercel env add NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
# ... 添加所有其他环境变量
```

#### 4.2 域名配置
1. 在 Vercel 中添加自定义域名
2. 配置 DNS 记录
3. 启用 SSL 证书

## 🔧 功能测试清单

部署完成后，请测试以下功能：

### 基本功能测试
- [ ] 用户注册和登录
- [ ] AI题目解析（免费用户限制3次/天）
- [ ] 题库访问（免费用户限制50题/天）
- [ ] 错题本功能

### 付费功能测试
- [ ] 查看定价页面
- [ ] 点击升级到Pro按钮
- [ ] 完成支付流程（测试模式）
- [ ] 验证Pro功能解锁
- [ ] 测试无限AI解析
- [ ] 测试完整题库访问

### 权限系统测试
- [ ] 免费用户达到使用限制后被阻止
- [ ] 付费用户可以无限使用
- [ ] 订阅取消后权限正确降级

### 仪表板测试
- [ ] 用户活动记录显示
- [ ] 使用统计更新
- [ ] 订阅状态显示

## 🚦 上线检查清单

在正式上线前，确保完成：

### 法律合规
- [ ] 更新服务条款中的联系信息
- [ ] 更新隐私政策中的公司地址
- [ ] 添加 Cookie 同意横幅（如需要）
- [ ] 设置 GDPR 合规流程

### 安全检查
- [ ] 所有生产环境密钥已设置
- [ ] 测试密钥已删除
- [ ] 启用 Stripe 生产模式
- [ ] 配置安全标头
- [ ] 设置速率限制

### 监控和分析
- [ ] 配置错误监控（Sentry）
- [ ] 设置用户行为分析
- [ ] 配置支付状态监控
- [ ] 设置关键指标警报

### 客户支持
- [ ] 设置客服邮箱
- [ ] 创建FAQ页面
- [ ] 准备退款处理流程
- [ ] 配置用户反馈收集

## 📊 关键功能说明

### 定价策略
- **免费版**：每日3次AI解析，50题访问，基础功能
- **Pro版**：无限AI解析，完整题库，SmartRouter，学习统计
- **企业版**：Pro功能 + 批量管理 + API接入 + 定制服务

### 权限控制
系统自动根据用户订阅状态控制功能访问：
- API级别权限检查
- 前端UI状态管理  
- 使用量实时追踪
- 优雅的升级提示

### 支付流程
1. 用户选择套餐
2. 重定向到Stripe Checkout
3. 支付成功后更新用户权限
4. 自动发送确认邮件
5. 30天退款保证

### 数据安全
- 所有敏感数据加密存储
- 符合GDPR和其他隐私法规
- 定期安全审计
- 用户数据可完全删除

## 🎯 收益优化建议

### 转化率优化
1. **免费试用体验**：确保免费用户能体验核心价值
2. **升级提示时机**：在用户遇到限制时优雅提示
3. **价值展示**：突出Pro版独有功能的价值
4. **社会证明**：添加用户评价和使用统计

### 定价优化
1. **A/B测试**：测试不同价格点的转化率
2. **年付优惠**：提供年付折扣提高用户生命周期价值
3. **学生折扣**：针对核心用户群体的特殊优惠
4. **地区定价**：根据不同地区调整价格策略

## 📞 技术支持

如需技术支持，请联系：
- 技术支持邮箱：shenqingyi16@gmail.com
- 客服邮箱：3123155744@qq.com

部署过程中遇到问题，请检查：
1. 环境变量配置是否正确
2. 数据库表是否创建成功
3. Stripe配置是否完整
4. 域名DNS配置是否正确

---

🎉 **恭喜！您的QuizMate现已具备完整的商业化能力，可以开始盈利了！**