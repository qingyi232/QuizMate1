-- PayPal订阅相关表
-- 在Supabase SQL编辑器中执行这些语句

-- PayPal订阅表
CREATE TABLE IF NOT EXISTS paypal_subscriptions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    subscription_id VARCHAR(255) NOT NULL UNIQUE, -- PayPal订阅ID
    plan_id VARCHAR(255) NOT NULL, -- PayPal计划ID
    status VARCHAR(50) NOT NULL, -- PayPal订阅状态：APPROVAL_PENDING, APPROVED, ACTIVE, SUSPENDED, CANCELLED
    subscription_data JSONB, -- 完整的PayPal订阅数据
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- PayPal产品表
CREATE TABLE IF NOT EXISTS paypal_products (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    product_id VARCHAR(255) NOT NULL UNIQUE, -- PayPal产品ID
    name VARCHAR(255) NOT NULL,
    description TEXT,
    type VARCHAR(50) DEFAULT 'SERVICE',
    category VARCHAR(100) DEFAULT 'SOFTWARE',
    product_data JSONB, -- 完整的PayPal产品数据
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- PayPal计划表
CREATE TABLE IF NOT EXISTS paypal_plans (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    plan_id VARCHAR(255) NOT NULL UNIQUE, -- PayPal计划ID
    product_id VARCHAR(255) NOT NULL, -- PayPal产品ID
    name VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(50) DEFAULT 'ACTIVE',
    pricing_data JSONB, -- 定价信息
    plan_data JSONB, -- 完整的PayPal计划数据
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- PayPal支付事件表（用于记录webhook事件）
CREATE TABLE IF NOT EXISTS paypal_events (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    event_id VARCHAR(255) NOT NULL UNIQUE, -- PayPal事件ID
    event_type VARCHAR(100) NOT NULL, -- 事件类型
    resource_type VARCHAR(100), -- 资源类型
    subscription_id VARCHAR(255), -- 关联的订阅ID
    event_data JSONB NOT NULL, -- 完整的事件数据
    processed BOOLEAN DEFAULT FALSE, -- 是否已处理
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 添加索引以提高查询性能
CREATE INDEX IF NOT EXISTS idx_paypal_subscriptions_user_id ON paypal_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_paypal_subscriptions_subscription_id ON paypal_subscriptions(subscription_id);
CREATE INDEX IF NOT EXISTS idx_paypal_subscriptions_status ON paypal_subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_paypal_events_event_type ON paypal_events(event_type);
CREATE INDEX IF NOT EXISTS idx_paypal_events_subscription_id ON paypal_events(subscription_id);
CREATE INDEX IF NOT EXISTS idx_paypal_events_processed ON paypal_events(processed);

-- 更新现有的profiles表，添加PayPal订阅相关字段
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS paypal_subscription_id VARCHAR(255),
ADD COLUMN IF NOT EXISTS paypal_customer_id VARCHAR(255);

-- 创建触发器来自动更新updated_at字段
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 为所有表创建updated_at触发器
CREATE TRIGGER update_paypal_subscriptions_updated_at BEFORE UPDATE ON paypal_subscriptions FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_paypal_products_updated_at BEFORE UPDATE ON paypal_products FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_paypal_plans_updated_at BEFORE UPDATE ON paypal_plans FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- 启用行级安全性（RLS）
ALTER TABLE paypal_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE paypal_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE paypal_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE paypal_events ENABLE ROW LEVEL SECURITY;

-- 创建RLS策略
-- 用户只能查看自己的订阅
CREATE POLICY "Users can view own subscriptions" ON paypal_subscriptions
    FOR SELECT USING (auth.uid() = user_id);

-- 服务角色可以管理所有数据
CREATE POLICY "Service role can manage all subscriptions" ON paypal_subscriptions
    FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- 所有用户都可以查看产品和计划（只读）
CREATE POLICY "Everyone can view products" ON paypal_products
    FOR SELECT USING (true);

CREATE POLICY "Everyone can view plans" ON paypal_plans
    FOR SELECT USING (true);

-- 只有服务角色可以管理产品、计划和事件
CREATE POLICY "Service role can manage products" ON paypal_products
    FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "Service role can manage plans" ON paypal_plans
    FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "Service role can manage events" ON paypal_events
    FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');