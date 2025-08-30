-- 国内支付和认证系统数据库架构

-- 支付订单表
CREATE TABLE IF NOT EXISTS public.payment_orders (
    id VARCHAR(50) PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    plan_type VARCHAR(20) NOT NULL,
    payment_method VARCHAR(20) NOT NULL, -- 'alipay', 'wechat'
    amount INTEGER NOT NULL, -- 金额，单位：分
    currency VARCHAR(3) DEFAULT 'CNY',
    status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'paid', 'cancelled', 'refunded'
    transaction_id VARCHAR(100), -- 第三方支付平台交易ID
    paid_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    metadata JSONB DEFAULT '{}'::jsonb
);

-- 短信验证码表
CREATE TABLE IF NOT EXISTS public.sms_codes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    phone VARCHAR(11) NOT NULL,
    code VARCHAR(6) NOT NULL,
    used BOOLEAN DEFAULT FALSE,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 扩展现有的profiles表以支持手机号
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS phone VARCHAR(11) UNIQUE;

-- 为手机号添加索引
CREATE INDEX IF NOT EXISTS idx_profiles_phone ON public.profiles(phone);
CREATE INDEX IF NOT EXISTS idx_sms_codes_phone_code ON public.sms_codes(phone, code);
CREATE INDEX IF NOT EXISTS idx_sms_codes_expires_at ON public.sms_codes(expires_at);
CREATE INDEX IF NOT EXISTS idx_payment_orders_user_id ON public.payment_orders(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_orders_status ON public.payment_orders(status);

-- 创建更新时间戳触发器函数
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 为payment_orders表添加更新时间戳触发器
DROP TRIGGER IF EXISTS trigger_payment_orders_updated_at ON public.payment_orders;
CREATE TRIGGER trigger_payment_orders_updated_at
    BEFORE UPDATE ON public.payment_orders
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- 清理过期验证码的函数
CREATE OR REPLACE FUNCTION public.cleanup_expired_sms_codes()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM public.sms_codes 
    WHERE expires_at < NOW() - INTERVAL '1 day';
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- 权限设置
-- 允许认证用户访问支付订单表
ALTER TABLE public.payment_orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own payment orders" ON public.payment_orders
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own payment orders" ON public.payment_orders
    FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own payment orders" ON public.payment_orders
    FOR UPDATE USING (auth.uid() = user_id);

-- 短信验证码表不需要RLS，但要限制访问
GRANT SELECT, INSERT, UPDATE ON public.sms_codes TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.payment_orders TO authenticated;

-- 创建视图：用户支付统计
CREATE OR REPLACE VIEW public.user_payment_stats AS
SELECT 
    user_id,
    COUNT(*) as total_orders,
    COUNT(CASE WHEN status = 'paid' THEN 1 END) as paid_orders,
    SUM(CASE WHEN status = 'paid' THEN amount ELSE 0 END) as total_paid,
    MAX(CASE WHEN status = 'paid' THEN paid_at END) as last_payment_date
FROM public.payment_orders
GROUP BY user_id;

GRANT SELECT ON public.user_payment_stats TO authenticated;

-- 插入示例数据（可选，用于测试）
-- INSERT INTO public.payment_orders (id, user_id, plan_type, payment_method, amount, status)
-- VALUES ('test_order_1', 'example-user-uuid', 'pro_monthly', 'alipay', 2999, 'pending');

COMMENT ON TABLE public.payment_orders IS '支付订单表';
COMMENT ON TABLE public.sms_codes IS '短信验证码表';
COMMENT ON COLUMN public.profiles.phone IS '用户手机号码';
COMMENT ON VIEW public.user_payment_stats IS '用户支付统计视图';