#!/usr/bin/env node

/**
 * 简化版自动导入脚本
 */

const fs = require('fs')
const path = require('path')

async function simpleImport() {
  console.log('🚀 开始导入专业题库...')
  
  // 使用fetch API进行导入
  const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args))
  
  try {
    // 读取数据
    const dataPath = path.join(__dirname, '..', 'professional-data', 'professional-questions.json')
    const questionData = JSON.parse(fs.readFileSync(dataPath, 'utf8'))
    
    console.log(`📊 准备导入 ${questionData.questions.length} 个专业题目`)
    
    // 调用API
    const response = await fetch('http://localhost:3001/api/questions/import', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...questionData,
        source: 'professional_bank_auto',
        overwrite_duplicates: false
      })
    })
    
    if (!response.ok) {
      throw new Error(`HTTP错误: ${response.status} ${response.statusText}`)
    }
    
    const result = await response.json()
    
    console.log('\n✅ 导入成功!')
    console.log(`📈 导入结果:`)
    console.log(`   - 成功导入: ${result.importedCount || 0} 题`)
    console.log(`   - 跳过重复: ${result.duplicateCount || 0} 题`)
    console.log(`   - 错误数量: ${result.errors?.length || 0} 个`)
    
    if (result.errors && result.errors.length > 0) {
      console.log('\n❌ 错误详情:')
      result.errors.slice(0, 5).forEach((error, index) => {
        console.log(`   ${index + 1}. ${error}`)
      })
      if (result.errors.length > 5) {
        console.log(`   ... 还有 ${result.errors.length - 5} 个错误`)
      }
    }
    
    console.log('\n🎉 专业题库导入完成!')
    console.log('\n📋 接下来您可以:')
    console.log('   1. 访问题库中心: http://localhost:3001/questions')
    console.log('   2. 测试AI解析: http://localhost:3001/quiz')
    console.log('   3. 查看学习统计: http://localhost:3001/dashboard')
    
  } catch (error) {
    console.error('❌ 导入失败:', error.message)
    
    // 如果是连接错误，提供备选方案
    if (error.message.includes('ECONNREFUSED') || error.message.includes('fetch')) {
      console.log('\n🔧 备选方案:')
      console.log('1. 确认开发服务器正在运行 (npm run dev)')
      console.log('2. 手动访问: http://localhost:3001/questions/import')
      console.log('3. 点击"专业题库"标签 → 选择"完整专业题库" → 点击"立即导入"')
    }
    
    throw error
  }
}

// 执行导入
simpleImport()
  .then(() => process.exit(0))
  .catch(() => process.exit(1))