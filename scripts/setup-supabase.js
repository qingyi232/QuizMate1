#!/usr/bin/env node

/**
 * QuizMate Supabase 快速配置脚本
 * 帮助用户快速配置Supabase连接
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

async function main() {
  console.log('🚀 QuizMate Supabase 配置向导');
  console.log('=====================================\n');

  // 检查是否已有配置文件
  const envPath = path.join(process.cwd(), '.env.local');
  const hasExistingConfig = fs.existsSync(envPath);

  if (hasExistingConfig) {
    const overwrite = await question('⚠️  发现现有配置文件，是否覆盖？ (y/N): ');
    if (overwrite.toLowerCase() !== 'y') {
      console.log('配置已取消');
      rl.close();
      return;
    }
  }

  console.log('请从 Supabase 控制台获取以下信息：');
  console.log('导航到：设置 → API\n');

  // 收集Supabase配置
  const supabaseUrl = await question('📍 项目URL (https://xxx.supabase.co): ');
  const anonKey = await question('🔑 匿名公钥 (anon public): ');
  const serviceKey = await question('🔐 服务密钥 (service_role): ');

  console.log('\n可选：AI服务配置');
  const useAI = await question('是否配置 OpenAI API？ (y/N): ');
  let openaiKey = '';
  if (useAI.toLowerCase() === 'y') {
    openaiKey = await question('🤖 OpenAI API Key (sk-...): ');
  }

  // 生成配置文件内容
  const envContent = `# QuizMate 环境配置
# 由配置向导自动生成于 ${new Date().toISOString()}

# ===========================================
# Supabase 数据库配置 (必填)
# ===========================================
NEXT_PUBLIC_SUPABASE_URL=${supabaseUrl}
NEXT_PUBLIC_SUPABASE_ANON_KEY=${anonKey}
SUPABASE_SERVICE_ROLE_KEY=${serviceKey}

# ===========================================
# AI 服务配置
# ===========================================
${openaiKey ? `OPENAI_API_KEY=${openaiKey}` : '# OPENAI_API_KEY=sk-your-openai-key'}
AI_PROVIDER=openai

# ===========================================
# 应用配置
# ===========================================
APP_BASE_URL=http://localhost:3000
MAX_FREE_REQUESTS_PER_DAY=50
MODEL_FREE=gpt-4o-mini
MODEL_PAID=gpt-4o-mini

# ===========================================
# 支付配置 (可选)
# ===========================================
# STRIPE_SECRET_KEY=sk_test_...
# STRIPE_PUBLISHABLE_KEY=pk_test_...
# STRIPE_WEBHOOK_SECRET=whsec_...
# STRIPE_PRICE_ID_MONTHLY=price_...

# ===========================================
# 分析配置 (可选)
# ===========================================
# NEXT_PUBLIC_POSTHOG_KEY=phc_...
# NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com

# ===========================================
# 监控配置 (可选)
# ===========================================
# SENTRY_DSN=https://...@sentry.io/...
`;

  // 写入配置文件
  try {
    fs.writeFileSync(envPath, envContent);
    console.log('\n✅ 配置文件已创建：.env.local');
    
    // 验证配置
    console.log('\n🔍 验证配置...');
    const isValidUrl = supabaseUrl.includes('supabase.co');
    const isValidAnonKey = anonKey.startsWith('eyJ');
    const isValidServiceKey = serviceKey.startsWith('eyJ');
    
    if (isValidUrl && isValidAnonKey && isValidServiceKey) {
      console.log('✅ 配置看起来正确！');
    } else {
      console.log('⚠️  配置可能有误，请检查：');
      if (!isValidUrl) console.log('   - URL 格式不正确');
      if (!isValidAnonKey) console.log('   - 匿名密钥格式不正确');
      if (!isValidServiceKey) console.log('   - 服务密钥格式不正确');
    }

    console.log('\n🎯 下一步：');
    console.log('1. 在 Supabase 控制台中运行数据库设置脚本');
    console.log('   - 复制 supabase-setup.sql 到 SQL 编辑器');
    console.log('   - 复制 supabase-rls-policies.sql 到 SQL 编辑器');
    console.log('2. 重启开发服务器：');
    console.log('   npm run dev');
    console.log('3. 访问 http://localhost:3000 测试应用');

  } catch (error) {
    console.error('\n❌ 配置文件创建失败：', error.message);
  }

  rl.close();
}

// 错误处理
process.on('SIGINT', () => {
  console.log('\n\n配置已取消');
  rl.close();
  process.exit(0);
});

main().catch(console.error);