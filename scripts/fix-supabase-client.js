#!/usr/bin/env node

/**
 * 修复Supabase客户端初始化问题
 * 在所有API路由中添加missing await
 */

const fs = require('fs');
const path = require('path');

// 需要修复的文件列表
const files = [
  'src/app/api/stripe-webhook/route.ts',
  'src/app/api/stripe/route.ts', 
  'src/app/api/health/route.ts',
  'src/app/api/flashcards/route.ts',
  'src/app/api/questions/route.ts',
  'src/app/api/questions/import/route.ts',
  'src/app/api/usage/route.ts'
];

function fixFile(filePath) {
  try {
    if (!fs.existsSync(filePath)) {
      console.log(`⚠️  文件不存在: ${filePath}`);
      return false;
    }

    let content = fs.readFileSync(filePath, 'utf8');
    const originalContent = content;

    // 替换所有 'const supabase = createClient()' 为 'const supabase = await createClient()'
    content = content.replace(
      /const supabase = createClient\(\)/g,
      'const supabase = await createClient()'
    );

    if (content !== originalContent) {
      fs.writeFileSync(filePath, content);
      console.log(`✅ 已修复: ${filePath}`);
      return true;
    } else {
      console.log(`✓ 无需修复: ${filePath}`);
      return false;
    }
  } catch (error) {
    console.error(`❌ 修复失败 ${filePath}:`, error.message);
    return false;
  }
}

async function main() {
  console.log('🔧 开始修复Supabase客户端初始化问题...\n');

  let fixedCount = 0;
  for (const file of files) {
    if (fixFile(file)) {
      fixedCount++;
    }
  }

  console.log(`\n🎉 修复完成! 共修复了 ${fixedCount} 个文件`);
  console.log('\n📋 下一步:');
  console.log('1. 重启开发服务器: npm run dev');
  console.log('2. 测试AI解析功能');
}

main().catch(console.error);