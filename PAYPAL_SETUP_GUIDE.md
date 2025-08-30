# PayPal订阅集成配置指南

本指南将帮助您完成PayPal订阅功能的完整配置，包括账户设置、环境变量配置和测试流程。

## 📋 **目录**
1. [PayPal开发者账户设置](#paypal开发者账户设置)
2. [环境变量配置](#环境变量配置)
3. [数据库表创建](#数据库表创建)
4. [测试订阅流程](#测试订阅流程)
5. [生产环境部署](#生产环境部署)
6. [常见问题](#常见问题)

## 🔧 **PayPal开发者账户设置**

### 步骤1：创建PayPal开发者账户

1. 访问 [PayPal开发者网站](https://developer.paypal.com/)
2. 使用您的PayPal账户登录，或创建新账户
3. 登录后，您将进入PayPal开发者仪表板

### 步骤2：创建应用程序

1. 在开发者仪表板中，点击 **"Create App"**
2. 填写应用信息：
   - **App Name**: QuizMate Subscription
   - **Merchant**: 选择您的商家账户（或使用默认的facilitator账户）
   - **Features**: 勾选 **"Subscriptions"**
3. 点击 **"Create App"**
image.png
### 步骤3：获取API凭据

创建应用后，您将看到：
- **Client ID** (公开密钥)
- **Client Secret** (私密密钥)

⚠️ **重要**: 请妥善保存这些凭据，特别是Client Secret，不要泄露给他人。

### 步骤4：配置沙盒测试账户

1. 在开发者仪表板中，点击 **"Sandbox" > "Accounts"**
2. 您将看到自动生成的测试账户：
   - **Business账户** (商家账户) - 用于接收付款
   - **Personal账户** (个人账户) - 用于模拟买家

## 🔑 **环境变量配置**

在项目根目录的 `.env.local` 文件中添加以下配置：

\`\`\`env
# PayPal配置 (沙盒环境)
PAYPAL_CLIENT_ID=your_sandbox_client_id_here
PAYPAL_CLIENT_SECRET=your_sandbox_client_secret_here
NEXT_PUBLIC_PAYPAL_CLIENT_ID=your_sandbox_client_id_here

# 网站URL配置
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Supabase配置 (如果还未配置)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
\`\`\`

### 配置说明

- **PAYPAL_CLIENT_ID**: PayPal应用的客户端ID（服务端使用）
- **PAYPAL_CLIENT_SECRET**: PayPal应用的客户端密钥（仅服务端使用）
- **NEXT_PUBLIC_PAYPAL_CLIENT_ID**: 客户端使用的PayPal客户端ID（必须以NEXT_PUBLIC_开头）
- **NEXT_PUBLIC_SITE_URL**: 您的网站URL，用于生成产品页面链接

## 🗄️ **数据库表创建**

### 步骤1：在Supabase中执行SQL脚本

1. 打开 Supabase 项目的 SQL 编辑器
2. 复制 `paypal-subscription-schema.sql` 文件中的内容
3. 粘贴到SQL编辑器中并执行
4. 确认所有表都创建成功：
   - `paypal_subscriptions`
   - `paypal_products`
   - `paypal_plans`
   - `paypal_events`

### 步骤2：验证表结构

执行以下查询验证表是否正确创建：

\`\`\`sql
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name LIKE 'paypal_%';
\`\`\`

## 🧪 **测试订阅流程**

### 步骤1：启动开发服务器

\`\`\`bash
npm run dev
\`\`\`

### 步骤2：访问订阅页面

打开浏览器访问：
\`\`\`
http://localhost:3000/paypal-subscription
\`\`\`

### 步骤3：测试订阅流程

1. **初始化计划**: 页面应该自动创建PayPal产品和订阅计划
2. **选择计划**: 选择一个订阅计划（建议选择"Pro Plan"）
3. **PayPal支付**: 点击PayPal按钮进行支付

### 步骤4：使用沙盒账户测试

当PayPal支付窗口打开时：
1. 使用您的沙盒个人账户登录
2. 完成支付流程
3. 验证是否跳转到成功页面

### 步骤5：验证数据库记录

检查 `paypal_subscriptions` 表是否有新记录：
\`\`\`sql
SELECT * FROM paypal_subscriptions ORDER BY created_at DESC LIMIT 5;
\`\`\`

## 🚀 **生产环境部署**

### 步骤1：创建生产应用

1. 在PayPal开发者仪表板中创建新的生产应用
2. 获取生产环境的Client ID和Client Secret

### 步骤2：更新环境变量

将 `.env.local` 中的测试凭据替换为生产凭据：

\`\`\`env
# PayPal配置 (生产环境)
PAYPAL_CLIENT_ID=your_live_client_id_here
PAYPAL_CLIENT_SECRET=your_live_client_secret_here
NEXT_PUBLIC_PAYPAL_CLIENT_ID=your_live_client_id_here

# 生产网站URL
NEXT_PUBLIC_SITE_URL=https://your-production-domain.com
\`\`\`

### 步骤3：验证生产环境

1. 部署到生产环境
2. 使用真实PayPal账户测试小额支付
3. 验证订阅数据正确保存

## ❓ **常见问题**

### Q1: PayPal按钮不显示或报错？

**解决方案**:
1. 检查 `NEXT_PUBLIC_PAYPAL_CLIENT_ID` 是否正确配置
2. 确认网络连接正常
3. 检查浏览器控制台的错误消息
4. 验证PayPal应用是否启用了订阅功能

### Q2: 创建产品或计划时报401错误？

**解决方案**:
1. 验证 `PAYPAL_CLIENT_ID` 和 `PAYPAL_CLIENT_SECRET` 是否正确
2. 检查PayPal应用是否启用了Subscriptions功能
3. 确认使用的是正确的环境（沙盒/生产）

### Q3: 订阅成功但数据库没有记录？

**解决方案**:
1. 检查 `save-subscription` API是否正常工作
2. 验证Supabase连接和权限
3. 查看服务器日志的错误信息
4. 确认用户认证状态

### Q4: 中国用户无法访问PayPal？

**解决方案**:
1. PayPal在中国大陆可能需要使用VPN
2. 考虑集成支付宝、微信支付等本地支付方式
3. 可以同时提供多种支付选项供用户选择

### Q5: 如何取消或管理订阅？

**管理方式**:
1. 用户可以在PayPal账户中直接管理订阅
2. 您也可以通过PayPal API实现订阅管理功能
3. 建议提供用户友好的订阅管理界面

## 🛠️ **开发提示**

### 调试技巧

1. **查看PayPal日志**: 在沙盒环境中可以查看详细的API调用日志
2. **使用Postman**: 可以直接测试PayPal API端点
3. **检查Webhook**: 考虑设置PayPal Webhook来处理订阅状态变化

### 安全考虑

1. **敏感信息**: 确保Client Secret仅在服务端使用
2. **HTTPS**: 生产环境必须使用HTTPS
3. **输入验证**: 对所有用户输入进行验证
4. **错误处理**: 提供友好的错误消息，但不泄露敏感信息

## 📞 **获取帮助**

如果您在配置过程中遇到问题：

1. **PayPal开发者文档**: https://developer.paypal.com/docs/subscriptions/
2. **PayPal社区论坛**: https://www.paypal-community.com/
3. **联系邮箱**: shenqingyi16@gmail.com

---

**祝您配置顺利！🎉**