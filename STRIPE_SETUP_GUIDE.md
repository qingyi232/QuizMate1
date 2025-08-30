# Stripe 配置详细指南 - 中国大陆用户专版

## 🇨🇳 **重要提醒：中国大陆用户注意事项**

### ❌ **直接注册的限制**
**遗憾的是，Stripe 目前不直接支持中国大陆的个人或企业注册。**

原因：
- Stripe 未在中国大陆获得支付牌照
- 中国的外汇管制政策
- 合规和监管要求不同

### ✅ **中国大陆用户的可行方案**

#### **方案一：使用香港公司（推荐）**
1. **注册香港公司**
   - 通过代理机构注册香港有限公司
   - 开设香港银行账户
   - 获得香港商业登记证

2. **Stripe 香港账户**
   - 使用香港公司信息注册
   - 提供香港地址和电话
   - 上传香港商业登记证等文件

3. **成本预估**
   - 香港公司注册：约 3,000-5,000 元人民币
   - 年度维护费用：约 2,000-3,000 元人民币
   - 银行开户：约 1,000-3,000 元人民币

#### **方案二：海外合作伙伴**
1. **寻找海外合作伙伴**
   - 美国、加拿大、欧盟、新加坡等地的朋友或合作伙伴
   - 使用其公司信息注册 Stripe 账户
   - 建立正式的合作协议

2. **法律考虑**
   - 签署正式合作协议
   - 明确收入分成和税务责任
   - 确保合规性

#### **方案三：使用国内支付方案（临时）**
如果暂时无法使用 Stripe，可以先使用国内支付方案：

1. **支付宝当面付**
2. **微信支付**
3. **银联支付**
4. **Ping++ 等聚合支付**

---

## 🏢 **Stripe 注册和配置详细步骤**

### **第一步：注册 Stripe 账户**

1. **访问 Stripe 官网**
   ```
   https://stripe.com/
   ```

2. **点击 "Start now" 开始注册**

3. **填写基本信息**
   - 邮箱地址：shenqingyi16@gmail.com
   - 密码：设置强密码
   - 国家/地区：选择合适的国家（非中国大陆）

4. **验证邮箱**
   - 查收验证邮件
   - 点击链接完成验证

### **第二步：完善账户信息**

1. **公司信息**
   ```
   Business name: QuizMate
   Business type: Individual / Company
   Industry: Education Technology
   ```

2. **个人信息**
   ```
   Legal name: [真实姓名]
   Date of birth: [出生日期]
   Address: [海外地址]
   Phone: [海外电话]
   ```

3. **银行账户信息**
   ```
   Bank account: [海外银行账户]
   Routing number: [银行路由号码]
   Account number: [账户号码]
   ```

### **第三步：创建产品和价格**

1. **登录 Stripe Dashboard**
   ```
   https://dashboard.stripe.com/
   ```

2. **导航到 Products**
   - 点击左侧菜单 "Products"
   - 点击 "Add product"

3. **创建 Pro 高级版产品**
   ```
   Product name: QuizMate Pro 高级版
   Description: 无限次AI解析，完整题库访问，SmartRouter多模型等高级功能
   
   Price:
   - Amount: $4.99
   - Currency: USD
   - Billing: Recurring monthly
   - Price ID: 复制并保存这个 ID
   ```

4. **记录价格 ID**
   ```bash
   # 示例 ID，实际需要使用您创建的
   STRIPE_PRO_PRICE_ID=price_1ABcDeFgHiJkLmNo
   ```

### **第四步：配置 Webhook**

1. **导航到 Webhooks**
   - 点击左侧菜单 "Developers"
   - 点击 "Webhooks"
   - 点击 "Add endpoint"

2. **配置 Webhook 端点**
   ```
   Endpoint URL: https://yourdomain.com/api/stripe-webhook
   
   Events to listen to:
   ✅ customer.subscription.created
   ✅ customer.subscription.updated  
   ✅ customer.subscription.deleted
   ✅ invoice.payment_succeeded
   ✅ invoice.payment_failed
   ✅ payment_intent.succeeded
   ```

3. **获取 Webhook 签名密钥**
   ```bash
   # 复制并保存 Webhook signing secret
   STRIPE_WEBHOOK_SECRET=whsec_1ABcDeFgHiJkLmNo...
   ```

### **第五步：获取 API 密钥**

1. **获取测试密钥（开发阶段）**
   ```bash
   # Developers > API keys
   STRIPE_PUBLISHABLE_KEY=pk_test_...
   STRIPE_SECRET_KEY=sk_test_...
   ```

2. **获取生产密钥（上线时）**
   ```bash
   # 切换到 Live mode
   STRIPE_PUBLISHABLE_KEY=pk_live_...
   STRIPE_SECRET_KEY=sk_live_...
   ```

### **第六步：配置项目环境变量**

1. **更新 `.env.local` 文件**
   ```env
   # Stripe 配置
   STRIPE_SECRET_KEY=sk_test_51xxxxx
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_51xxxxx
   STRIPE_WEBHOOK_SECRET=whsec_xxxxx
   STRIPE_PRO_PRICE_ID=price_xxxxx
   ```

2. **更新代码中的价格 ID**
   ```typescript
   // src/app/api/create-checkout-session/route.ts
   const selectedPlan = planConfig[plan as keyof typeof planConfig]
   ```

---

## 🧪 **测试支付流程**

### **使用 Stripe 测试卡号**

1. **成功支付测试**
   ```
   卡号: 4242 4242 4242 4242
   过期日期: 任意未来日期 (如 12/25)
   CVC: 任意3位数字 (如 123)
   ```

2. **失败支付测试**
   ```
   卡号: 4000 0000 0000 0002
   过期日期: 任意未来日期
   CVC: 任意3位数字
   ```

3. **其他测试卡**
   ```
   需要3D验证: 4000 0027 6000 3184
   余额不足: 4000 0000 0000 9995
   ```

### **测试流程**

1. **访问定价页面**
   ```
   http://localhost:3000/pricing
   ```

2. **点击升级到Pro**
3. **填写测试邮箱**
4. **使用测试卡号完成支付**
5. **检查 Stripe Dashboard 是否有记录**
6. **验证用户权限是否正确升级**

---

## 🚀 **生产环境配置**

### **切换到生产模式**

1. **在 Stripe Dashboard 中**
   - 右上角切换到 "Live" 模式
   - 完成身份验证流程
   - 提供必要的文件和信息

2. **更新环境变量**
   ```env
   STRIPE_SECRET_KEY=sk_live_...
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
   ```

3. **更新 Webhook 端点**
   ```
   生产环境URL: https://yourdomain.com/api/stripe-webhook
   ```

### **身份验证要求**

Stripe 可能要求您提供：
- 政府颁发的身份证件
- 银行账户验证文件
- 业务许可证或注册文件
- 网站和服务的详细信息

---

## 💡 **替代支付方案（中国方案）**

如果 Stripe 不可行，建议使用以下方案：

### **1. 支付宝国际版**
```javascript
// 支付宝当面付
const alipayConfig = {
  appId: 'your_app_id',
  merchantId: 'your_merchant_id',
  publicKey: 'your_public_key'
}
```

### **2. 微信支付**
```javascript
// 微信支付配置
const wechatConfig = {
  appId: 'your_app_id',
  mchId: 'your_merchant_id',
  key: 'your_api_key'
}
```

### **3. Ping++ 聚合支付**
```javascript
// 支持多种支付方式
const pingppConfig = {
  appId: 'your_pingpp_app_id',
  apiKey: 'your_pingpp_api_key'
}
```

---

## 📋 **检查清单**

### ✅ **Stripe 配置完成清单**
- [ ] 注册 Stripe 账户（通过合适的方式）
- [ ] 完成身份验证
- [ ] 创建 Pro 版本产品
- [ ] 配置价格（$4.99/月）
- [ ] 设置 Webhook 端点
- [ ] 获取 API 密钥
- [ ] 配置环境变量
- [ ] 测试支付流程
- [ ] 验证权限升级
- [ ] 配置生产环境

### ⚠️ **注意事项**
- 确保遵守当地法律法规
- 定期查看 Stripe 的合规要求
- 保存所有重要的配置信息
- 建立安全的密钥管理流程

---

## 🆘 **常见问题解答**

**Q: 我可以使用 VPN 注册 Stripe 吗？**
A: 不建议。Stripe 有严格的反欺诈系统，使用 VPN 可能导致账户被封。

**Q: 注册时需要什么文件？**
A: 通常需要身份证件、银行对账单、业务许可证等。具体要求因国家而异。

**Q: 多久可以收到款项？**
A: 通常是 2-7 个工作日，首次收款可能需要更长时间。

**Q: 手续费是多少？**
A: 通常是 2.9% + $0.30 每笔交易，具体费率因地区而异。

---

## 📞 **需要帮助？**

如果在配置过程中遇到问题，请联系：
- 技术支持：shenqingyi16@gmail.com
- 客服邮箱：3123155744@qq.com

我们会尽快为您提供支持！