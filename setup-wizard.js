#!/usr/bin/env node

/**
 * QuizMate 设置向导
 * 帮助用户配置 Supabase 数据库、OpenAI API 等核心功能
 */

const fs = require('fs')
const path = require('path')
const readline = require('readline')

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

const question = (prompt) => new Promise((resolve) => rl.question(prompt, resolve))

class QuizMateSetup {
  constructor() {
    this.config = {}
  }

  async run() {
    console.log('\n🚀 欢迎使用 QuizMate 设置向导！')
    console.log('我们将帮您配置以下核心功能：')
    console.log('✨ Supabase 数据库')
    console.log('🤖 OpenAI API')
    console.log('💳 Stripe 支付（可选）')
    console.log('📊 PostHog 分析（可选）\n')

    try {
      await this.setupSupabase()
      await this.setupOpenAI()
      await this.setupOptionalServices()
      await this.createEnvFile()
      await this.showNextSteps()
    } catch (error) {
      console.error('❌ 设置过程中出现错误:', error.message)
    } finally {
      rl.close()
    }
  }

  async setupSupabase() {
    console.log('\n📊 配置 Supabase 数据库')
    console.log('请访问 https://app.supabase.com 创建新项目\n')

    this.config.NEXT_PUBLIC_SUPABASE_URL = await question('请输入 Supabase URL: ')
    this.config.NEXT_PUBLIC_SUPABASE_ANON_KEY = await question('请输入 Supabase Anon Key: ')
    this.config.SUPABASE_SERVICE_ROLE_KEY = await question('请输入 Supabase Service Role Key: ')

    console.log('\n✅ Supabase 配置完成！')
    console.log('💡 接下来需要在 Supabase SQL Editor 中运行数据库脚本：')
    console.log('   1. sql/001_initial_schema.sql')
    console.log('   2. sql/002_rls_policies.sql')
    console.log('   3. sql/003_functions.sql')
  }

  async setupOpenAI() {
    console.log('\n🤖 配置 OpenAI API')
    console.log('请访问 https://platform.openai.com/api-keys 获取 API Key\n')

    this.config.OPENAI_API_KEY = await question('请输入 OpenAI API Key: ')
    this.config.AI_PROVIDER = 'openai'
    this.config.MODEL_FREE = 'gpt-4o-mini'
    this.config.MODEL_PAID = 'gpt-4o-mini'
    this.config.AI_OUTPUT_LANGUAGE = 'zh-CN'
    this.config.MAX_FREE_REQUESTS_PER_DAY = '5'

    console.log('\n✅ OpenAI 配置完成！')
  }

  async setupOptionalServices() {
    console.log('\n🛠️ 可选服务配置')
    
    const setupStripe = await question('是否配置 Stripe 支付? (y/N): ')
    if (setupStripe.toLowerCase() === 'y') {
      this.config.STRIPE_SECRET_KEY = await question('请输入 Stripe Secret Key: ')
      this.config.STRIPE_PUBLISHABLE_KEY = await question('请输入 Stripe Publishable Key: ')
      this.config.STRIPE_WEBHOOK_SECRET = await question('请输入 Stripe Webhook Secret: ')
      this.config.APP_BASE_URL = 'http://localhost:3000'
    }

    const setupPostHog = await question('是否配置 PostHog 分析? (y/N): ')
    if (setupPostHog.toLowerCase() === 'y') {
      this.config.NEXT_PUBLIC_POSTHOG_KEY = await question('请输入 PostHog Key: ')
      this.config.NEXT_PUBLIC_POSTHOG_HOST = 'https://app.posthog.com'
    }
  }

  async createEnvFile() {
    const envContent = Object.entries(this.config)
      .map(([key, value]) => `${key}=${value}`)
      .join('\n')

    fs.writeFileSync('.env.local', envContent)
    console.log('\n✅ .env.local 文件已创建！')
  }

  async showNextSteps() {
    console.log('\n🎉 设置完成！接下来请运行：')
    console.log('1. npm run db:setup  # 设置数据库表结构')
    console.log('2. npm run dev       # 启动开发服务器')
    console.log('3. 访问 http://localhost:3000 测试功能')
    console.log('\n📚 如需帮助，请查看 README.md')
  }
}

// 运行设置向导
new QuizMateSetup().run()