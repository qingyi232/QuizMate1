#!/usr/bin/env node
/**
 * 数据库设置脚本
 * 用于创建手机号登录所需的数据表
 */

const fs = require('fs');
const https = require('https');
require('dotenv').config({ path: '.env.local' });

// 从环境变量获取 Supabase 配置
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ 缺少 Supabase 环境变量配置');
  console.error('请确保 .env.local 文件中包含:');
  console.error('- NEXT_PUBLIC_SUPABASE_URL');
  console.error('- SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

console.log('🚀 开始设置数据库...');
console.log(`📡 连接到: ${SUPABASE_URL}`);

// 读取 SQL 文件
const sqlContent = fs.readFileSync('sms-tables-setup.sql', 'utf8');

// 准备 API 请求
const url = new URL('/rest/v1/rpc/exec_sql', SUPABASE_URL);
const postData = JSON.stringify({
  sql: sqlContent
});

const options = {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(postData),
    'apikey': SUPABASE_SERVICE_KEY
  }
};

// 发送请求
const req = https.request(url, options, (res) => {
  let data = '';
  
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    if (res.statusCode === 200 || res.statusCode === 201) {
      console.log('✅ 数据库设置成功！');
      console.log('🎉 现在可以使用手机号登录功能了');
      console.log('\n📋 已创建的表:');
      console.log('  - sms_codes (短信验证码)');
      console.log('  - user_activities (用户活动记录)');
      console.log('  - profiles (用户资料)');
    } else {
      console.error('❌ 数据库设置失败');
      console.error(`状态码: ${res.statusCode}`);
      console.error('响应:', data);
    }
  });
});

req.on('error', (error) => {
  console.error('❌ 请求失败:', error.message);
  console.log('\n🔧 手动设置步骤:');
  console.log('1. 登录 Supabase Dashboard');
  console.log('2. 进入 SQL Editor');
  console.log('3. 执行 sms-tables-setup.sql 文件中的 SQL 语句');
});

req.write(postData);
req.end();
