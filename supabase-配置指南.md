# 🚀 Supabase 数据库配置完整指南

## 📋 第1步：获取Supabase配置信息

### 在您的Supabase控制台中：

1. **进入API设置页面**：
   - 点击左侧菜单 `设置` → `API`
   
2. **复制以下信息**：
   ```
   项目URL: https://xxx.supabase.co
   匿名公钥 (anon public): eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   服务密钥 (service_role): eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

## 🗄️ 第2步：创建数据库表结构

### 在Supabase控制台中：

1. **进入SQL编辑器**：
   - 点击左侧菜单 `SQL编辑器`
   
2. **运行表结构脚本**：
   - 复制 `supabase-setup.sql` 文件中的所有内容
   - 粘贴到SQL编辑器中
   - 点击 `运行` 按钮
   
3. **运行安全策略脚本**：
   - 复制 `supabase-rls-policies.sql` 文件中的所有内容
   - 粘贴到SQL编辑器中
   - 点击 `运行` 按钮

## ⚙️ 第3步：配置环境变量

### 创建 `.env.local` 文件：

在项目根目录创建 `.env.local` 文件，添加以下内容：

```env
# Supabase 配置 (必填)
NEXT_PUBLIC_SUPABASE_URL=https://你的项目id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=你的匿名公钥
SUPABASE_SERVICE_ROLE_KEY=你的服务密钥

# AI 服务配置 (推荐)
OPENAI_API_KEY=sk-你的OpenAI密钥
AI_PROVIDER=openai

# 应用配置
APP_BASE_URL=http://localhost:3000
MAX_FREE_REQUESTS_PER_DAY=50
MODEL_FREE=gpt-4o-mini
MODEL_PAID=gpt-4o-mini
```

### 重启开发服务器：

```bash
# 停止当前服务器 (Ctrl+C)
# 然后重新启动
npm run dev
```

## 🔄 第4步：从演示模式迁移数据

### 导出演示数据：

1. **访问题库页面**：
   ```
   http://localhost:3000/questions
   ```

2. **点击"导出数据"按钮**：
   - 这将下载一个JSON文件包含您的演示数据

### 导入到Supabase：

1. **注册/登录账户**：
   - 在应用中正常注册一个账户
   
2. **手动导入数据**：
   - 进入 `/questions/import` 页面
   - 选择 "上传文件" 
   - 上传刚才导出的JSON文件

## ✅ 第5步：验证配置

### 检查数据库连接：

1. **测试注册登录**：
   - 注册新账户
   - 确认能够正常登录
   
2. **测试AI解析**：
   - 访问 `/quiz` 页面
   - 输入一个问题进行解析
   - 确认能够正常生成答案和卡片

3. **验证数据持久化**：
   - 刷新页面，确认数据还在
   - 登出再登入，确认数据还在

## 🌍 第6步：配置生产环境

### 设置邮箱验证 (可选)：

1. **进入认证设置**：
   - Supabase控制台 → `认证` → `设置`
   
2. **配置邮箱模板**：
   - 自定义确认邮件模板
   - 设置重定向URL

### 配置存储桶 (文件上传)：

1. **创建存储桶**：
   - Supabase控制台 → `存储`
   - 创建名为 `uploads` 的桶
   
2. **设置访问策略**：
   ```sql
   -- 允许已认证用户上传文件
   CREATE POLICY "用户可以上传文件" ON storage.objects
     FOR INSERT WITH CHECK (auth.role() = 'authenticated');
   ```

## 🔧 故障排除

### 常见问题：

1. **连接失败**：
   - 检查URL和API密钥是否正确
   - 确认网络连接正常
   
2. **权限错误**：
   - 确认RLS策略已正确设置
   - 检查用户是否已登录
   
3. **数据不显示**：
   - 确认数据库表已创建
   - 检查控制台错误信息

### 调试命令：

```bash
# 查看环境变量
echo $NEXT_PUBLIC_SUPABASE_URL

# 检查数据库连接
npx supabase status

# 重置缓存
rm -rf .next
npm run dev
```

## 🎯 完成后的好处

✅ **数据持久化**: 数据永久保存，不会丢失  
✅ **多设备同步**: 在任何设备上访问您的数据  
✅ **实时更新**: 支持实时数据同步  
✅ **安全保障**: 行级安全策略保护数据  
✅ **可扩展性**: 支持大量用户和数据  
✅ **国际化**: 全球CDN提供快速访问  

## 📞 需要帮助？

如果遇到任何问题：

1. **检查Supabase控制台日志**
2. **查看浏览器开发者工具错误**
3. **参考Supabase官方文档**
4. **在项目Issue中报告问题**

---

**🎉 配置完成后，您就拥有了一个完全功能的国际化学习平台！**