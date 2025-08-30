/**
 * 批量导入多学科国际化题库脚本
 * 运行: npx ts-node src/scripts/seedSubjectQuestions.ts
 */

import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'

// Supabase 配置
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ 请配置 SUPABASE 环境变量')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

interface QuestionData {
  subject: string
  topic: string
  difficulty: string
  language: string
  question: string
  question_type: string
  options: Record<string, string> | null
  correct_answer: string
  explanation: string
  tags: string[]
  popularity_score: number
}

async function seedQuestions() {
  console.log('🚀 开始导入多学科题库...')
  
  try {
    // 1. 读取题目数据
    const dataPath = path.join(process.cwd(), 'international-questions-data.json')
    const rawData = fs.readFileSync(dataPath, 'utf8')
    const questionsData: QuestionData[] = JSON.parse(rawData)
    
    console.log(`📚 准备导入 ${questionsData.length} 道题目`)
    
    // 2. 批量插入数据
    let successCount = 0
    let errorCount = 0
    
    for (let index = 0; index < questionsData.length; index++) {
      const questionData = questionsData[index]
      try {
        console.log(`📝 导入第 ${index + 1} 题: ${questionData.subject} - ${questionData.topic}`)
        
        // 生成题目hash避免重复
        const crypto = await import('crypto')
        const hash = crypto
          .createHash('sha256')
          .update(questionData.question + questionData.subject + questionData.topic)
          .digest('hex')
          .substring(0, 32)
        
        const { data, error } = await supabase
          .from('subject_questions')
          .insert({
            subject: questionData.subject,
            topic: questionData.topic,
            difficulty: questionData.difficulty,
            language: questionData.language,
            question: questionData.question,
            question_type: questionData.question_type,
            options: questionData.options,
            correct_answer: questionData.correct_answer,
            explanation: questionData.explanation,
            tags: questionData.tags,
            popularity_score: questionData.popularity_score,
            verified: true,
            source_info: {
              import_source: 'seed_script',
              import_date: new Date().toISOString(),
              batch: 'international_questions_v1'
            }
          })
        
        if (error) {
          console.error(`   ❌ 导入失败: ${error.message}`)
          errorCount++
        } else {
          console.log(`   ✅ 导入成功`)
          successCount++
        }
        
        // 控制导入速度避免API限制
        await new Promise(resolve => setTimeout(resolve, 100))
        
      } catch (err) {
        console.error(`   💥 导入第 ${index + 1} 题时出错:`, err)
        errorCount++
      }
    }
    
    // 3. 显示导入结果
    console.log('\\n🎉 导入完成!')
    console.log(`✅ 成功导入: ${successCount} 道题`)
    console.log(`❌ 导入失败: ${errorCount} 道题`)
    console.log(`📊 总共处理: ${questionsData.length} 道题`)
    
    // 4. 显示学科统计
    console.log('\\n📚 导入题目按学科分布:')
    const subjectStats = questionsData.reduce((acc, q) => {
      acc[q.subject] = (acc[q.subject] || 0) + 1
      return acc
    }, {} as Record<string, number>)
    
    Object.entries(subjectStats).forEach(([subject, count]) => {
      console.log(`   • ${subject}: ${count} 道题`)
    })
    
    // 5. 显示难度分布
    console.log('\\n📈 按难度分布:')
    const difficultyStats = questionsData.reduce((acc, q) => {
      acc[q.difficulty] = (acc[q.difficulty] || 0) + 1
      return acc
    }, {} as Record<string, number>)
    
    Object.entries(difficultyStats).forEach(([difficulty, count]) => {
      console.log(`   • ${difficulty}: ${count} 道题`)
    })
    
    // 6. 验证导入结果
    console.log('\\n🔍 验证导入结果...')
    const { data: totalCount } = await supabase
      .from('subject_questions')
      .select('id', { count: 'exact' })
    
    console.log(`📊 数据库中现有总题目数: ${totalCount?.length || 0}`)
    
  } catch (error) {
    console.error('💥 导入过程发生错误:', error)
    process.exit(1)
  }
}

// 运行导入
if (require.main === module) {
  seedQuestions()
    .then(() => {
      console.log('\\n✅ 脚本执行完成!')
      process.exit(0)
    })
    .catch(error => {
      console.error('❌ 脚本执行失败:', error)
      process.exit(1)
    })
}