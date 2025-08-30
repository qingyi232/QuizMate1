#!/usr/bin/env node

/**
 * QuizMate 数据库设置脚本
 * 自动执行所有数据库初始化脚本
 */

const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')
require('dotenv').config({ path: '.env.local' })

async function setupDatabase() {
  console.log('🚀 开始设置 QuizMate 数据库...')

  // 检查环境变量
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceRoleKey) {
    console.error('❌ 缺少 Supabase 环境变量!')
    console.log('请先运行: node setup-wizard.js')
    process.exit(1)
  }

  // 创建 Supabase 客户端（使用服务角色密钥）
  const supabase = createClient(supabaseUrl, serviceRoleKey)

  try {
    // 读取并执行 SQL 脚本
    const sqlFiles = [
      'sql/001_initial_schema.sql',
      'sql/002_rls_policies.sql', 
      'sql/003_functions.sql'
    ]

    for (const sqlFile of sqlFiles) {
      console.log(`📄 执行 ${sqlFile}...`)
      
      const sqlContent = fs.readFileSync(sqlFile, 'utf8')
      
      // 按分号分割SQL语句
      const statements = sqlContent
        .split(';')
        .map(stmt => stmt.trim())
        .filter(stmt => stmt && !stmt.startsWith('--'))

      for (const statement of statements) {
        if (statement) {
          const { error } = await supabase.rpc('exec_sql', { 
            sql_query: statement + ';' 
          })
          
          if (error && !error.message.includes('already exists')) {
            console.warn(`⚠️  SQL 警告: ${error.message}`)
          }
        }
      }

      console.log(`✅ ${sqlFile} 执行完成`)
    }

    // 检验表是否创建成功
    console.log('\n🔍 验证数据库表...')
    const { data: tables, error } = await supabase.rpc('get_tables')
    
    const expectedTables = [
      'profiles', 'questions', 'answers', 'flashcards', 
      'quizzes', 'quiz_items', 'attempts', 'usage_daily', 
      'subscriptions', 'answer_cache'
    ]

    if (tables) {
      const tableNames = tables.map(t => t.table_name)
      const missingTables = expectedTables.filter(t => !tableNames.includes(t))
      
      if (missingTables.length === 0) {
        console.log('✅ 所有表创建成功!')
      } else {
        console.log('⚠️  缺少表:', missingTables.join(', '))
      }
    }

    // 插入示例题库数据
    await insertSampleQuestions(supabase)

    console.log('\n🎉 数据库设置完成!')
    console.log('现在可以运行: npm run dev')

  } catch (error) {
    console.error('❌ 数据库设置失败:', error.message)
    process.exit(1)
  }
}

async function insertSampleQuestions(supabase) {
  console.log('\n📚 插入示例题库数据...')
  
  const sampleQuestions = [
    {
      content: 'Which gas is most responsible for the greenhouse effect?\nA) Oxygen\nB) Nitrogen\nC) Carbon dioxide\nD) Argon',
      subject: 'Environmental Science',
      grade: 'High School',
      language: 'en',
      source: 'import',
      hash: 'sample_greenhouse_gas_mcq'
    },
    {
      content: 'Solve: 2x + 5 = 17. Show your steps.',
      subject: 'Mathematics',
      grade: 'Middle School', 
      language: 'en',
      source: 'import',
      hash: 'sample_algebra_equation'
    },
    {
      content: '判断题：地球是太阳系中最大的行星。',
      subject: 'Geography',
      grade: 'Elementary',
      language: 'zh-CN',
      source: 'import', 
      hash: 'sample_earth_size_tf'
    }
  ]

  try {
    // 创建系统用户profile（如果不存在）
    const { data: systemUser } = await supabase.auth.admin.createUser({
      email: 'system@quizmate.ai',
      password: 'temp_password_123',
      email_confirm: true
    })

    for (const question of sampleQuestions) {
      const { error } = await supabase
        .from('questions')
        .upsert({
          ...question,
          user_id: systemUser?.user?.id || null,
          meta: { sample: true, public: true }
        }, { 
          onConflict: 'hash',
          ignoreDuplicates: true 
        })

      if (error) {
        console.warn(`⚠️  插入题目警告: ${error.message}`)
      }
    }

    console.log('✅ 示例题库数据插入完成!')
  } catch (error) {
    console.warn('⚠️  示例数据插入失败:', error.message)
  }
}

// 运行设置
setupDatabase()