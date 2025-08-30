-- 用户表扩展（添加订阅信息）
CREATE TABLE IF NOT EXISTS users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255),
    subscription_status VARCHAR(50) DEFAULT 'free', -- free, active, canceled, expired
    subscription_plan VARCHAR(50) DEFAULT 'free', -- free, pro, enterprise
    stripe_customer_id VARCHAR(255),
    stripe_subscription_id VARCHAR(255),
    subscription_start_date TIMESTAMP,
    subscription_end_date TIMESTAMP,
    daily_ai_usage INTEGER DEFAULT 0,
    daily_questions_accessed INTEGER DEFAULT 0,
    last_usage_reset DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 支付交易记录表
CREATE TABLE IF NOT EXISTS payment_transactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    stripe_session_id VARCHAR(255),
    stripe_customer_id VARCHAR(255),
    stripe_subscription_id VARCHAR(255),
    plan VARCHAR(50) NOT NULL,
    amount INTEGER NOT NULL, -- 金额（分）
    currency VARCHAR(10) DEFAULT 'usd',
    status VARCHAR(50) NOT NULL, -- pending, completed, failed, refunded
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 用户活动日志表
CREATE TABLE IF NOT EXISTS user_activities (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    action VARCHAR(100) NOT NULL, -- 活动类型
    details JSONB, -- 详细信息
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 用户使用限额表
CREATE TABLE IF NOT EXISTS usage_limits (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    plan VARCHAR(50) NOT NULL,
    daily_ai_limit INTEGER DEFAULT -1, -- -1 表示无限制
    daily_questions_limit INTEGER DEFAULT -1,
    features JSONB, -- 可用功能列表
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 插入默认的使用限额配置
INSERT INTO usage_limits (plan, daily_ai_limit, daily_questions_limit, features) VALUES
('free', 3, 50, '["basic_ocr", "error_book", "community_support"]'),
('pro', -1, -1, '["unlimited_ai", "full_question_bank", "smart_router", "advanced_ocr", "practice_mode", "statistics", "priority_support", "offline_mode"]'),
('enterprise', -1, -1, '["unlimited_ai", "full_question_bank", "smart_router", "advanced_ocr", "practice_mode", "statistics", "priority_support", "offline_mode", "bulk_management", "custom_import", "api_access", "white_label"]');

-- 创建索引以提高性能
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_subscription_status ON users(subscription_status);
CREATE INDEX IF NOT EXISTS idx_users_stripe_customer_id ON users(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_user_id ON payment_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_status ON payment_transactions(status);
CREATE INDEX IF NOT EXISTS idx_user_activities_user_id ON user_activities(user_id);
CREATE INDEX IF NOT EXISTS idx_user_activities_action ON user_activities(action);
CREATE INDEX IF NOT EXISTS idx_user_activities_created_at ON user_activities(created_at);

-- 创建视图：用户订阅状态统计
CREATE OR REPLACE VIEW user_subscription_stats AS
SELECT 
    subscription_plan,
    subscription_status,
    COUNT(*) as user_count,
    AVG(daily_ai_usage) as avg_ai_usage,
    AVG(daily_questions_accessed) as avg_questions_accessed
FROM users 
GROUP BY subscription_plan, subscription_status;

-- 创建函数：重置每日使用限额
CREATE OR REPLACE FUNCTION reset_daily_usage()
RETURNS void AS $$
BEGIN
    UPDATE users 
    SET 
        daily_ai_usage = 0,
        daily_questions_accessed = 0,
        last_usage_reset = CURRENT_DATE
    WHERE last_usage_reset < CURRENT_DATE;
END;
$$ LANGUAGE plpgsql;

-- 创建函数：检查用户权限
CREATE OR REPLACE FUNCTION check_user_permission(
    user_email VARCHAR(255), 
    action VARCHAR(100)
)
RETURNS boolean AS $$
DECLARE
    user_plan VARCHAR(50);
    user_status VARCHAR(50);
    plan_features JSONB;
    daily_usage INTEGER;
    usage_limit INTEGER;
BEGIN
    -- 获取用户信息
    SELECT subscription_plan, subscription_status, daily_ai_usage
    INTO user_plan, user_status, daily_usage
    FROM users 
    WHERE email = user_email;
    
    -- 检查用户是否存在
    IF user_plan IS NULL THEN
        RETURN FALSE;
    END IF;
    
    -- 检查订阅状态
    IF user_status NOT IN ('free', 'active') THEN
        RETURN FALSE;
    END IF;
    
    -- 获取套餐限制
    SELECT features, daily_ai_limit
    INTO plan_features, usage_limit
    FROM usage_limits 
    WHERE plan = user_plan;
    
    -- 检查功能权限
    IF action = 'ai_analysis' THEN
        -- 检查AI解析权限
        IF usage_limit > 0 AND daily_usage >= usage_limit THEN
            RETURN FALSE;
        END IF;
        RETURN plan_features ? 'unlimited_ai' OR plan_features ? 'basic_ai';
    END IF;
    
    -- 检查其他权限
    RETURN plan_features ? action;
END;
$$ LANGUAGE plpgsql;