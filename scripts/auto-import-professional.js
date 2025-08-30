#!/usr/bin/env node

/**
 * 自动导入专业题库脚本
 * 直接调用API将34个专业题目导入到QuizMate
 */

const fs = require('fs')
const path = require('path')
const { exec } = require('child_process')

async function importProfessionalQuestions() {
  console.log('🚀 开始自动导入专业题库...')
  
  // 读取专业题库数据
  const dataPath = path.join(__dirname, '..', 'professional-data', 'professional-questions.json')
  
  if (!fs.existsSync(dataPath)) {
    console.error('❌ 专业题库文件不存在:', dataPath)
    return
  }
  
  const questionData = JSON.parse(fs.readFileSync(dataPath, 'utf8'))
  console.log(`📊 发现 ${questionData.questions.length} 个专业题目`)
  
  // 显示要导入的专业领域
  const subjects = [...new Set(questionData.questions.map(q => q.subject))]
  console.log('📚 专业领域包括:')
  subjects.forEach(subject => {
    const count = questionData.questions.filter(q => q.subject === subject).length
    console.log(`   - ${subject} (${count}题)`)
  })
  
  // 准备导入数据
  const importData = {
    ...questionData,
    source: 'professional_bank_auto_import',
    overwrite_duplicates: false
  }
  
  // 将数据写入临时文件
  const tempFile = path.join(__dirname, 'temp-import.json')
  fs.writeFileSync(tempFile, JSON.stringify(importData, null, 2))
  
  console.log('\n🔄 正在调用导入API...')
  
  // 使用PowerShell调用API
  const powershellCmd = `
    $headers = @{
      'Content-Type' = 'application/json'
    }
    $body = Get-Content -Path "${tempFile}" -Raw
    try {
      $response = Invoke-RestMethod -Uri "http://localhost:3001/api/questions/import" -Method POST -Headers $headers -Body $body
      $response | ConvertTo-Json -Depth 10
    } catch {
      Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
      Write-Host "Response: $($_.Exception.Response)" -ForegroundColor Red
    }
  `
  
  return new Promise((resolve, reject) => {
    exec(`powershell -Command "${powershellCmd}"`, (error, stdout, stderr) => {
      // 清理临时文件
      if (fs.existsSync(tempFile)) {
        fs.unlinkSync(tempFile)
      }
      
      if (error) {
        console.error('❌ API调用失败:', error.message)
        reject(error)
        return
      }
      
      if (stderr) {
        console.warn('⚠️ 警告:', stderr)
      }
      
      try {
        const result = JSON.parse(stdout)
        console.log('\n✅ 导入成功!')
        console.log(`📈 导入结果:`)
        console.log(`   - 成功导入: ${result.importedCount || 0} 题`)
        console.log(`   - 跳过重复: ${result.duplicateCount || 0} 题`)
        console.log(`   - 错误数量: ${result.errors?.length || 0} 个`)
        
        if (result.errors && result.errors.length > 0) {
          console.log('\n❌ 错误详情:')
          result.errors.forEach((error, index) => {
            console.log(`   ${index + 1}. ${error}`)
          })
        }
        
        console.log('\n🎉 专业题库导入完成!')
        console.log('\n📋 接下来您可以:')
        console.log('   1. 访问题库中心: http://localhost:3001/questions')
        console.log('   2. 测试AI解析: http://localhost:3001/quiz')
        console.log('   3. 查看学习统计: http://localhost:3001/dashboard')
        
        resolve(result)
      } catch (parseError) {
        console.log('\n📄 原始响应:', stdout)
        console.error('❌ 解析响应失败:', parseError.message)
        reject(parseError)
      }
    })
  })
}

// 执行导入
importProfessionalQuestions()
  .then(() => {
    console.log('\n🏆 自动导入任务完成!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n💥 导入失败:', error.message)
    process.exit(1)
  })