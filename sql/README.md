# QuizMate Database Setup

此目录包含 QuizMate 应用程序的数据库架构和迁移脚本。

## 📁 文件结构

```
sql/
├── 001_initial_schema.sql  # 初始数据库架构和表结构
├── 002_rls_policies.sql    # 行级安全策略 (RLS)
├── 003_functions.sql       # 数据库函数和存储过程
└── README.md              # 本文档
```

## 🚀 快速开始

### 1. 准备环境变量

确保在项目根目录创建 `.env.local` 文件：

```bash
# Supabase 配置
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### 2. 手动设置数据库 (推荐)

由于 Supabase 的安全限制，建议手动执行 SQL 脚本：

1. 访问 [Supabase Dashboard](https://supabase.com/dashboard)
2. 选择你的项目
3. 进入 "SQL Editor"
4. 按顺序执行以下脚本：

   **步骤 1**: 复制并执行 `001_initial_schema.sql`
   ```sql
   -- 创建所有表、索引和触发器
   ```

   **步骤 2**: 复制并执行 `002_rls_policies.sql`
   ```sql
   -- 设置行级安全策略
   ```

   **步骤 3**: 复制并执行 `003_functions.sql`
   ```sql
   -- 创建数据库函数
   ```

### 3. 使用脚本设置 (备用方案)

```bash
# 自动迁移 (可能需要手动干预)
npm run db:migrate

# 或者手动设置指南
npm run db:migrate -- --setup

# 重置数据库 (⚠️ 危险操作)
npm run db:reset

# 添加示例数据
npm run db:seed
```

## 📊 数据库架构

### 核心表

| 表名 | 描述 | 关键字段 |
|------|------|----------|
| `profiles` | 用户配置信息 | `id`, `email`, `plan`, `locale` |
| `questions` | 用户提交的问题 | `user_id`, `content`, `hash` |
| `answers` | AI 生成的答案 | `question_id`, `answer`, `explanation` |
| `flashcards` | 学习卡片 | `question_id`, `front`, `back` |
| `quizzes` | 测验集合 | `user_id`, `title` |
| `quiz_items` | 测验问题关联 | `quiz_id`, `question_id`, `order` |
| `attempts` | 测验尝试记录 | `quiz_id`, `user_id`, `score` |
| `usage_daily` | 每日使用统计 | `user_id`, `date`, `count` |
| `subscriptions` | 订阅信息 | `user_id`, `stripe_customer_id` |
| `answer_cache` | AI 响应缓存 | `hash`, `answer` |

### 关系图

```
auth.users (Supabase Auth)
    ↓
profiles (1:1)
    ↓
questions (1:N) → answers (1:1)
    ↓           → flashcards (1:N)
quizzes (1:N) ← quiz_items (N:N) → questions
    ↓
attempts (1:N)

profiles → usage_daily (1:N)
profiles → subscriptions (1:1)
```

## 🔒 安全策略 (RLS)

所有表都启用了行级安全 (Row Level Security)：

- **用户数据隔离**: 用户只能访问自己的数据
- **答案关联**: 只能访问自己问题的答案和卡片
- **缓存共享**: `answer_cache` 对所有认证用户可读，仅服务角色可写
- **服务角色**: 拥有完全访问权限，用于后端操作

## 🛠️ 数据库函数

| 函数名 | 描述 | 参数 |
|--------|------|------|
| `get_daily_usage()` | 获取用户当日使用次数 | `user_id`, `date` |
| `increment_daily_usage()` | 增加使用次数 | `user_id`, `date` |
| `check_daily_limit()` | 检查是否达到限额 | `user_id`, `limit` |
| `get_user_plan()` | 获取用户订阅计划 | `user_id` |
| `cleanup_old_cache()` | 清理过期缓存 | `days_old` |
| `update_flashcard_due_date()` | 更新间隔重复时间 | `flashcard_id`, `performance` |
| `get_due_flashcards()` | 获取到期的卡片 | `user_id`, `limit` |

## 📈 索引优化

为了确保查询性能，我们创建了以下关键索引：

- `questions`: `user_id`, `hash`, `created_at`
- `answers`: `question_id`, `created_at`
- `flashcards`: `question_id`, `spaced_due_at`
- `usage_daily`: `(user_id, date)` 复合索引
- `answer_cache`: `created_at` (用于清理)

## 🔄 维护操作

### 定期清理缓存

```sql
-- 清理 30 天前的缓存
SELECT cleanup_old_cache(30);
```

### 用户数据统计

```sql
-- 查看用户使用情况
SELECT 
  p.email,
  p.plan,
  COUNT(q.id) as question_count,
  MAX(q.created_at) as last_activity
FROM profiles p
LEFT JOIN questions q ON q.user_id = p.id
GROUP BY p.id, p.email, p.plan;
```

### 缓存命中率

```sql
-- 查看缓存使用情况
SELECT 
  COUNT(*) as total_cache_entries,
  COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '7 days') as recent_entries
FROM answer_cache;
```

## ⚠️ 重要注意事项

1. **备份**: 在执行任何迁移前，请确保备份数据库
2. **测试**: 建议先在开发环境测试所有脚本
3. **权限**: 确保使用的是 `service_role` 密钥执行迁移
4. **监控**: 迁移后检查 RLS 策略是否正确工作

## 🆘 故障排除

### 常见问题

**问题**: RPC 函数调用失败
```
解决方案: 手动在 Supabase 控制台执行 SQL 脚本
```

**问题**: 权限被拒绝
```
解决方案: 检查是否使用了正确的 service_role 密钥
```

**问题**: 外键约束错误
```
解决方案: 确保按照正确顺序创建表和插入数据
```

### 验证设置

```sql
-- 检查表是否存在
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('profiles', 'questions', 'answers');

-- 检查 RLS 是否启用
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';

-- 测试触发器
INSERT INTO auth.users (id, email) 
VALUES ('test-id', 'test@example.com');
```

---

📞 **需要帮助?** 请查看项目文档或创建 GitHub Issue。