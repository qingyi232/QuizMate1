# 📧 SMTP邮件服务配置指南

为了启用联系表单的邮件发送功能，您需要配置SMTP邮件服务。

## 🔧 环境变量配置

在您的 `.env.local` 文件中添加以下环境变量：

```env
# SMTP邮件服务配置
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=noreply@quizmate.com
CONTACT_EMAIL=shenqingyi16@gmail.com
```

## 📮 Gmail配置示例

### 1. 获取Gmail应用程序密码

1. 登录您的Gmail账户
2. 进入 **Google账户设置** → **安全**
3. 启用 **两步验证**（必须先启用）
4. 在安全页面找到 **应用程序密码**
5. 选择"邮件"和您的设备，生成16位应用程序密码
6. 将此密码用作 `SMTP_PASS`

### 2. Gmail配置参数

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-gmail@gmail.com
SMTP_PASS=your-16-digit-app-password
```

## 📧 QQ邮箱配置示例

### 1. 获取QQ邮箱授权码

1. 登录QQ邮箱
2. 进入 **设置** → **账户**
3. 开启 **POP3/IMAP/SMTP/Exchange/CardDAV/CalDAV服务**
4. 获取授权码

### 2. QQ邮箱配置参数

```env
SMTP_HOST=smtp.qq.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-qq@qq.com
SMTP_PASS=your-qq-auth-code
```

## 🛠️ 其他邮件服务商

### Outlook/Hotmail
```env
SMTP_HOST=smtp.live.com
SMTP_PORT=587
SMTP_SECURE=false
```

### 163邮箱
```env
SMTP_HOST=smtp.163.com
SMTP_PORT=587
SMTP_SECURE=false
```

### 126邮箱
```env
SMTP_HOST=smtp.126.com
SMTP_PORT=587
SMTP_SECURE=false
```

## 🔐 安全注意事项

1. **永远不要**将真实的邮箱密码直接写入代码
2. 使用应用程序专用密码或授权码
3. 确保 `.env.local` 文件已添加到 `.gitignore`
4. 生产环境使用专门的邮件服务（如SendGrid、AWS SES等）

## ✅ 测试配置

配置完成后，访问联系页面 `http://localhost:3000/contact` 并发送测试邮件验证配置是否正确。

## 🚀 生产环境建议

对于生产环境，建议使用专业的邮件服务：

- **SendGrid**: 稳定、可靠，有免费套餐
- **AWS SES**: 成本低，适合大量发送
- **Mailgun**: 功能强大，API友好
- **阿里云邮件推送**: 适合国内用户

## 🔍 故障排查

### 常见错误

1. **身份验证失败**
   - 检查用户名和密码/授权码是否正确
   - 确认已启用相应的邮件服务

2. **连接超时**
   - 检查SMTP主机地址和端口
   - 确认网络连接正常

3. **TLS/SSL错误**
   - 尝试调整 `SMTP_SECURE` 设置
   - 对于端口465使用 `SMTP_SECURE=true`
   - 对于端口587使用 `SMTP_SECURE=false`

### 调试模式

如需查看详细错误信息，请检查服务器控制台输出。

## 📞 获取帮助

如果在配置过程中遇到问题，请：

1. 检查环境变量配置
2. 查看服务器日志
3. 联系技术支持：shenqingyi16@gmail.com