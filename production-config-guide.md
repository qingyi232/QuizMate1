# 🚀 QuizMate 生产环境配置指南

## 📋 环境变量配置

创建 `.env.local` 文件并添加以下配置：

```env
# ===========================================
# Supabase 数据库配置 (必填)
# ===========================================
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# ===========================================
# AI 服务配置 (推荐)
# ===========================================
# OpenAI (推荐 - 最佳效果)
OPENAI_API_KEY=sk-...
AI_PROVIDER=openai

# DeepSeek (备选 - 便宜)
# DEEPSEEK_API_KEY=sk-...
# AI_PROVIDER=deepseek

# 阿里通义 (国内备选)
# QWEN_API_KEY=sk-...
# AI_PROVIDER=qwen

# ===========================================
# 应用配置
# ===========================================
APP_BASE_URL=https://your-domain.com
MAX_FREE_REQUESTS_PER_DAY=50
MODEL_FREE=gpt-4o-mini
MODEL_PAID=gpt-4o-mini

# ===========================================
# 支付配置 (可选)
# ===========================================
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_ID_MONTHLY=price_...

# ===========================================
# 分析配置 (可选)
# ===========================================
NEXT_PUBLIC_POSTHOG_KEY=phc_...
NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com

# ===========================================
# 监控配置 (可选)
# ===========================================
SENTRY_DSN=https://...@o...ingest.sentry.io/...
```

## 🌍 国际化部署建议

### 区域选择策略
```
🇺🇸 美东 (N. Virginia) - 全球通用
🇪🇺 欧洲 (Frankfurt) - 欧洲用户
🇸🇬 亚太 (Singapore) - 亚洲用户
```

### 性能优化
```
✅ 启用Supabase CDN
✅ 配置边缘函数
✅ 使用连接池
✅ 索引优化
```

### 安全设置
```
✅ 启用RLS策略
✅ 配置CORS域名
✅ 设置API限流
✅ 定期备份
```

## 💰 成本预估 (月费用)

### 个人/小团队
- Supabase免费版: $0
- OpenAI API: $5-20
- 域名: $1
- **总计: $6-21/月**

### 中型企业
- Supabase Pro: $25
- OpenAI API: $50-200
- 域名: $1
- CDN: $10
- **总计: $86-236/月**

### 大型企业
- Supabase Team: $599
- OpenAI API: $500+
- 专用服务: $200+
- **总计: $1299+/月**