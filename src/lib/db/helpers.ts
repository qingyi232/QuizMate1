import { createServiceClient } from './supabase-server'
import { Database } from './types'

type Tables = Database['public']['Tables']
type Profile = Tables['profiles']['Row']
type Question = Tables['questions']['Row']
type Answer = Tables['answers']['Row']
type Flashcard = Tables['flashcards']['Row']
type Quiz = Tables['quizzes']['Row']
type UsageDaily = Tables['usage_daily']['Row']

export class DatabaseHelpers {
  private supabase = createServiceClient()

  // Profile helpers
  async createProfile(userId: string, data: Partial<Profile>) {
    const { data: profile, error } = await this.supabase
      .from('profiles')
      .insert({
        id: userId,
        email: data.email,
        display_name: data.display_name,
        plan: data.plan || 'free',
        locale: data.locale || 'en'
      })
      .select()
      .single()

    if (error) throw error
    return profile
  }

  async getProfile(userId: string) {
    const { data, error } = await this.supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (error) throw error
    return data
  }

  async updateProfile(userId: string, updates: Partial<Profile>) {
    const { data, error } = await this.supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single()

    if (error) throw error
    return data
  }

  // Usage tracking helpers
  async getDailyUsage(userId: string, date?: string) {
    const targetDate = date || new Date().toISOString().split('T')[0]
    
    const { data, error } = await this.supabase
      .rpc('get_daily_usage', {
        p_user_id: userId,
        p_date: targetDate
      })

    if (error) throw error
    return data as number
  }

  async incrementDailyUsage(userId: string, date?: string) {
    const targetDate = date || new Date().toISOString().split('T')[0]
    
    const { data, error } = await this.supabase
      .rpc('increment_daily_usage', {
        p_user_id: userId,
        p_date: targetDate
      })

    if (error) throw error
    return data as number
  }

  async checkDailyLimit(userId: string, limit: number = 5) {
    const { data, error } = await this.supabase
      .rpc('check_daily_limit', {
        p_user_id: userId,
        p_limit: limit
      })

    if (error) throw error
    return data as boolean
  }

  async getUserPlan(userId: string) {
    const { data, error } = await this.supabase
      .rpc('get_user_plan', {
        p_user_id: userId
      })

    if (error) throw error
    return data as string
  }

  // Question helpers
  async createQuestion(data: Omit<Question, 'id' | 'created_at'>) {
    const { data: question, error } = await this.supabase
      .from('questions')
      .insert(data)
      .select()
      .single()

    if (error) throw error
    return question
  }

  async getQuestionByHash(hash: string, userId: string) {
    const { data, error } = await this.supabase
      .from('questions')
      .select(`
        *,
        answers(*),
        flashcards(*)
      `)
      .eq('hash', hash)
      .eq('user_id', userId)
      .single()

    if (error && error.code !== 'PGRST116') throw error
    return data
  }

  async getUserQuestions(userId: string, limit: number = 20, offset: number = 0) {
    const { data, error } = await this.supabase
      .from('questions')
      .select(`
        *,
        answers(*),
        flashcards(*)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) throw error
    return data
  }

  // Answer helpers
  async createAnswer(data: Omit<Answer, 'id' | 'created_at'>) {
    const { data: answer, error } = await this.supabase
      .from('answers')
      .insert(data)
      .select()
      .single()

    if (error) throw error
    return answer
  }

  // Flashcard helpers
  async createFlashcards(flashcards: Omit<Flashcard, 'id' | 'created_at'>[]) {
    const { data, error } = await this.supabase
      .from('flashcards')
      .insert(flashcards)
      .select()

    if (error) throw error
    return data
  }

  async getDueFlashcards(userId: string, limit: number = 10) {
    const { data, error } = await this.supabase
      .rpc('get_due_flashcards', {
        p_user_id: userId,
        p_limit: limit
      })

    if (error) throw error
    return data
  }

  async updateFlashcardDueDate(flashcardId: string, performance: number) {
    const { error } = await this.supabase
      .rpc('update_flashcard_due_date', {
        p_flashcard_id: flashcardId,
        p_performance: performance
      })

    if (error) throw error
  }

  // Cache helpers
  async getCachedAnswer(hash: string) {
    const { data, error } = await this.supabase
      .from('answer_cache')
      .select('answer')
      .eq('hash', hash)
      .single()

    if (error && error.code !== 'PGRST116') throw error
    return data?.answer
  }

  async setCachedAnswer(hash: string, normalizedPrompt: string, answer: any) {
    const { error } = await this.supabase
      .from('answer_cache')
      .upsert({
        hash,
        normalized_prompt: normalizedPrompt,
        answer
      })

    if (error) throw error
  }

  // Quiz helpers
  async createQuiz(data: Omit<Quiz, 'id' | 'created_at'>) {
    const { data: quiz, error } = await this.supabase
      .from('quizzes')
      .insert(data)
      .select()
      .single()

    if (error) throw error
    return quiz
  }

  async addQuestionsToQuiz(quizId: string, questionIds: string[]) {
    const quizItems = questionIds.map((questionId, index) => ({
      quiz_id: quizId,
      question_id: questionId,
      order: index + 1
    }))

    const { data, error } = await this.supabase
      .from('quiz_items')
      .insert(quizItems)
      .select()

    if (error) throw error
    return data
  }

  async getUserQuizzes(userId: string, limit: number = 20, offset: number = 0) {
    const { data, error } = await this.supabase
      .from('quizzes')
      .select(`
        *,
        quiz_items(
          question_id,
          order,
          questions(*)
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) throw error
    return data
  }

  // Subscription helpers
  async updateSubscription(userId: string, data: {
    status: string
    stripe_customer_id?: string
    stripe_sub_id?: string
    current_period_end?: string
  }) {
    const { error } = await this.supabase
      .from('subscriptions')
      .upsert({
        user_id: userId,
        ...data
      })

    if (error) throw error
  }

  async getSubscription(userId: string) {
    const { data, error } = await this.supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (error && error.code !== 'PGRST116') throw error
    return data
  }

  // Cleanup helpers
  async cleanupOldCache(daysOld: number = 30) {
    const { data, error } = await this.supabase
      .rpc('cleanup_old_cache', {
        days_old: daysOld
      })

    if (error) throw error
    return data as number
  }
}

// Export singleton instance
export const db = new DatabaseHelpers()