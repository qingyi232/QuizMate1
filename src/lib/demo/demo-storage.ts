/**
 * 演示模式数据存储管理
 * 注意：这仅用于演示目的，生产环境应使用真正的数据库
 */

export interface DemoQuestion {
  id: string
  user_id: string
  content: string
  subject?: string
  grade?: string
  language: string
  source: string
  created_at: string
  meta?: {
    question_type?: string
    options?: string[]
    correct_answer?: string
  }
}

export class DemoStorage {
  private static instance: DemoStorage
  private readonly STORAGE_KEY = 'quizmate_demo_data'
  private readonly USER_KEY = 'quizmate_demo_user'

  static getInstance(): DemoStorage {
    if (!DemoStorage.instance) {
      DemoStorage.instance = new DemoStorage()
    }
    return DemoStorage.instance
  }

  // 检查是否为演示模式
  isDemoMode(): boolean {
    // 检查是否配置了真实的Supabase
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    
    return !supabaseUrl || 
           supabaseUrl.includes('placeholder') || 
           !supabaseKey || 
           supabaseKey.includes('placeholder')
  }

  // 获取演示用户信息
  getDemoUser() {
    if (typeof window === 'undefined') return null
    
    const stored = localStorage.getItem(this.USER_KEY)
    if (stored) {
      return JSON.parse(stored)
    }
    
    // 创建默认演示用户
    const demoUser = {
      id: 'demo-user-id',
      email: 'demo@quizmate.com',
      name: '演示用户',
      created_at: new Date().toISOString()
    }
    
    localStorage.setItem(this.USER_KEY, JSON.stringify(demoUser))
    return demoUser
  }

  // 获取演示数据存储信息
  getStorageInfo() {
    if (typeof window === 'undefined') return null
    
    const questions = this.getQuestions()
    const storageSize = this.calculateStorageSize()
    
    return {
      questionCount: questions.length,
      storageSize: `${(storageSize / 1024).toFixed(1)} KB`,
      isDemo: true,
      warning: '⚠️ 演示模式：数据仅保存在本地浏览器，换设备或清除缓存会丢失'
    }
  }

  // 计算存储大小
  private calculateStorageSize(): number {
    const data = localStorage.getItem(this.STORAGE_KEY)
    return data ? new Blob([data]).size : 0
  }

  // 获取所有题目（包含自动迁移旧数据）
  getQuestions(): DemoQuestion[] {
    if (typeof window === 'undefined') return []
    
    // 尝试从新格式读取
    const stored = localStorage.getItem(this.STORAGE_KEY)
    if (stored) {
      try {
        return JSON.parse(stored)
      } catch (error) {
        console.error('Failed to parse demo questions:', error)
      }
    }
    
    // 尝试从旧格式迁移数据
    const oldData = localStorage.getItem('demo_questions')
    if (oldData) {
      try {
        const oldQuestions = JSON.parse(oldData)
        console.log(`🔄 迁移 ${oldQuestions.length} 个题目从旧格式到新格式`)
        
        // 保存到新格式
        this.saveQuestions(oldQuestions, false)
        
        // 清除旧数据
        localStorage.removeItem('demo_questions')
        
        return oldQuestions
      } catch (error) {
        console.error('Failed to migrate old demo questions:', error)
      }
    }
    
    return []
  }

  // 保存题目（追加或替换）
  saveQuestions(questions: DemoQuestion[], append: boolean = true): boolean {
    if (typeof window === 'undefined') return false
    
    try {
      let finalQuestions = questions
      
      if (append) {
        const existingQuestions = this.getQuestions()
        finalQuestions = [...existingQuestions, ...questions]
      }
      
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(finalQuestions))
      
      console.log(`✅ 演示模式：${append ? '追加' : '保存'} ${questions.length} 个题目`)
      console.log(`📊 总计：${finalQuestions.length} 个题目`)
      
      return true
    } catch (error) {
      console.error('Failed to save demo questions:', error)
      return false
    }
  }

  // 清除所有演示数据
  clearData(): void {
    if (typeof window === 'undefined') return
    
    localStorage.removeItem(this.STORAGE_KEY)
    localStorage.removeItem(this.USER_KEY)
    localStorage.removeItem('quizmate_demo_session')
    localStorage.removeItem('demo_questions') // 清除旧版本数据
    
    console.log('🗑️ 演示数据已清除')
  }

  // 导出数据（用于迁移到真实数据库）
  exportData(): string {
    const questions = this.getQuestions()
    const user = this.getDemoUser()
    const info = this.getStorageInfo()
    
    return JSON.stringify({
      meta: {
        exported_at: new Date().toISOString(),
        platform: 'QuizMate Demo Mode',
        version: '1.0',
        ...info
      },
      user,
      questions
    }, null, 2)
  }

  // 获取过滤后的题目
  getFilteredQuestions(filters: {
    search?: string
    subject?: string
    grade?: string
    language?: string
    page?: number
    limit?: number
  }): {
    questions: DemoQuestion[]
    total: number
    hasMore: boolean
  } {
    const allQuestions = this.getQuestions()
    
    // 应用过滤器
    let filtered = allQuestions.filter(q => {
      if (filters.search && !q.content.toLowerCase().includes(filters.search.toLowerCase())) {
        return false
      }
      if (filters.subject && filters.subject !== 'all' && q.subject !== filters.subject) {
        return false
      }
      if (filters.grade && filters.grade !== 'all' && q.grade !== filters.grade) {
        return false
      }
      if (filters.language && filters.language !== 'all' && q.language !== filters.language) {
        return false
      }
      return true
    })

    // 应用分页
    const page = filters.page || 1
    const limit = filters.limit || 20
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit
    const paginatedQuestions = filtered.slice(startIndex, endIndex)

    return {
      questions: paginatedQuestions,
      total: filtered.length,
      hasMore: endIndex < filtered.length
    }
  }
}

// 导出单例实例
export const demoStorage = DemoStorage.getInstance()