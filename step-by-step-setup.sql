-- 分步骤创建表，确保每步都成功

-- 第一步：创建短信验证码表
DROP TABLE IF EXISTS sms_codes CASCADE;
CREATE TABLE sms_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone VARCHAR(20) NOT NULL,
  code VARCHAR(6) NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  used BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 验证表创建成功
SELECT 'sms_codes table created' as step1;
