# 国内支付和登录系统配置指南

## 🚀 **快速开始**

我们已经为您集成了完整的国内支付和登录系统！以下是详细配置步骤：

## 📋 **功能概览**

### ✅ **已集成功能**
- 📱 **手机号登录** - 短信验证码登录
- 💰 **支付宝支付** - 网页支付，自动回调
- 💚 **微信支付** - 扫码支付，实时状态检查
- 🛡️ **安全验证** - 签名验证，防篡改
- 📊 **订单管理** - 完整的订单状态跟踪
- 🎯 **自动订阅** - 支付成功后自动升级用户权限

### 🎨 **用户界面**
- 现代化支付页面设计
- 手机号登录界面
- 支付状态实时反馈
- 多种支付方式选择

---

## ⚙️ **环境变量配置**

请在您的 `.env.local` 文件中添加以下配置：

### 🔐 **基础配置**
```env
JWT_SECRET=your-super-secret-jwt-key-here
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

### 🗄️ **数据库配置（已有）**
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

### 💰 **支付宝支付配置**
```env
# 支付宝开放平台应用信息
ALIPAY_APP_ID=your-alipay-app-id
ALIPAY_PRIVATE_KEY="-----BEGIN RSA PRIVATE KEY-----
your-private-key-content-here
-----END RSA PRIVATE KEY-----"
ALIPAY_PUBLIC_KEY="-----BEGIN PUBLIC KEY-----
alipay-public-key-content-here
-----END PUBLIC KEY-----"
```

### 💚 **微信支付配置**
```env
# 微信支付商户信息
WECHAT_APP_ID=your-wechat-app-id
WECHAT_MCH_ID=your-merchant-id
WECHAT_API_KEY=your-wechat-api-key
```

### 📱 **短信服务配置（阿里云）**
```env
# 阿里云短信服务
ALIYUN_SMS_ACCESS_KEY_ID=your-access-key-id
ALIYUN_SMS_ACCESS_KEY_SECRET=your-access-key-secret
ALIYUN_SMS_SIGN_NAME=QuizMate
ALIYUN_SMS_TEMPLATE_CODE=SMS_123456789
```

---

## 🏪 **支付平台申请指南**

### 💰 **支付宝开放平台**

1. **访问支付宝开放平台**
   ```
   https://open.alipay.com/
   ```

2. **创建应用**
   - 选择"网页/移动应用"
   - 填写应用信息
   - 上传应用图标

3. **配置能力**
   - 添加"手机网站支付"能力
   - 提交审核并等待通过

4. **获取密钥**
   - 生成RSA2密钥对
   - 上传公钥到支付宝
   - 保存私钥到环境变量

### 💚 **微信支付**

1. **注册微信支付商户**
   ```
   https://pay.weixin.qq.com/
   ```

2. **开通产品**
   - 开通"Native支付"（扫码支付）
   - 完成商户认证

3. **配置参数**
   - 获取商户号(mch_id)
   - 设置API密钥(api_key)
   - 下载证书文件（可选）

### 📱 **阿里云短信服务**

1. **开通短信服务**
   ```
   https://dysms.console.aliyun.com/
   ```

2. **创建签名**
   - 添加短信签名（如：QuizMate）
   - 等待审核通过

3. **创建模板**
   ```
   验证码模板示例：
   您的验证码是${code}，5分钟内有效，请勿泄露。
   ```

4. **获取密钥**
   - 创建AccessKey
   - 保存到环境变量

---

## 🗄️ **数据库设置**

### 1. 执行SQL脚本
在Supabase SQL编辑器中运行：
```bash
# 执行数据库迁移
domestic-payment-schema.sql
```

### 2. 表结构确认
确保以下表被成功创建：
- `payment_orders` - 支付订单表
- `sms_codes` - 短信验证码表
- `profiles` - 用户资料表（已扩展手机号字段）

---

## 🧪 **测试流程**

### 📱 **测试手机号登录**
1. 访问 `/auth/phone-login`
2. 输入测试手机号：13800138000
3. 开发环境会显示验证码
4. 输入验证码完成登录

### 💰 **测试支付流程**
1. 访问 `/pricing`
2. 点击"升级到Pro"
3. 选择支付方式
4. 完成测试支付

### 🔍 **支付测试环境**
- **支付宝**：使用沙箱环境
- **微信支付**：使用测试商户号
- **短信**：开发环境会在控制台显示验证码

---

## 📊 **支付流程说明**

### 支付宝流程：
```
用户点击升级 → 创建订单 → 跳转支付宝 → 用户支付 → 异步回调 → 更新订阅状态
```

### 微信支付流程：
```
用户点击升级 → 创建订单 → 显示二维码 → 用户扫码支付 → 异步回调 → 更新订阅状态
```

### 手机号登录流程：
```
输入手机号 → 发送验证码 → 输入验证码 → 验证成功 → 自动登录
```

---

## 🔧 **常见问题**

### Q: 开发环境如何测试支付？
A: 
- 支付宝：使用沙箱账号和沙箱网关
- 微信支付：使用测试商户号
- 手机短信：开发环境会显示验证码，无需真实发送

### Q: 生产环境需要什么？
A: 
- 真实的支付宝/微信商户账号
- 已备案的域名和SSL证书
- 阿里云短信服务实名认证

### Q: 如何切换到生产环境？
A: 
1. 更新环境变量为生产密钥
2. 修改网关地址为生产地址
3. 配置真实的回调URL

---

## 📞 **技术支持**

如遇配置问题，请联系：
- **技术支持**：shenqingyi16@gmail.com
- **客服邮箱**：3123155744@qq.com

---

## 🎉 **恭喜！**

您的QuizMate现在已经具备：
- ✅ 完整的国内支付系统
- ✅ 手机号快速登录
- ✅ 自动订阅管理
- ✅ 安全的用户认证

现在您可以为中国用户提供最佳的支付和登录体验了！