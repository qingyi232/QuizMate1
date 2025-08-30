export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string | null
          display_name: string | null
          plan: string
          locale: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email?: string | null
          display_name?: string | null
          plan?: string
          locale?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string | null
          display_name?: string | null
          plan?: string
          locale?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      questions: {
        Row: {
          id: string
          user_id: string
          source: 'paste' | 'upload' | 'import'
          content: string
          language: string | null
          subject: string | null
          grade: string | null
          meta: Json | null
          hash: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          source: 'paste' | 'upload' | 'import'
          content: string
          language?: string | null
          subject?: string | null
          grade?: string | null
          meta?: Json | null
          hash: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          source?: 'paste' | 'upload' | 'import'
          content?: string
          language?: string | null
          subject?: string | null
          grade?: string | null
          meta?: Json | null
          hash?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "questions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      answers: {
        Row: {
          id: string
          question_id: string
          answer: string
          explanation: string
          confidence: number | null
          model: string
          tokens: number | null
          cost_cents: number | null
          lang: string
          created_at: string
        }
        Insert: {
          id?: string
          question_id: string
          answer: string
          explanation: string
          confidence?: number | null
          model: string
          tokens?: number | null
          cost_cents?: number | null
          lang: string
          created_at?: string
        }
        Update: {
          id?: string
          question_id?: string
          answer?: string
          explanation?: string
          confidence?: number | null
          model?: string
          tokens?: number | null
          cost_cents?: number | null
          lang?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "answers_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: true
            referencedRelation: "questions"
            referencedColumns: ["id"]
          }
        ]
      }
      flashcards: {
        Row: {
          id: string
          question_id: string
          front: string
          back: string
          hint: string | null
          tags: string[]
          difficulty: number
          spaced_due_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          question_id: string
          front: string
          back: string
          hint?: string | null
          tags?: string[]
          difficulty?: number
          spaced_due_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          question_id?: string
          front?: string
          back?: string
          hint?: string | null
          tags?: string[]
          difficulty?: number
          spaced_due_at?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "flashcards_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "questions"
            referencedColumns: ["id"]
          }
        ]
      }
      quizzes: {
        Row: {
          id: string
          user_id: string
          title: string
          meta: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          meta?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          meta?: Json | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "quizzes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      quiz_items: {
        Row: {
          id: string
          quiz_id: string
          question_id: string
          order: number
        }
        Insert: {
          id?: string
          quiz_id: string
          question_id: string
          order: number
        }
        Update: {
          id?: string
          quiz_id?: string
          question_id?: string
          order?: number
        }
        Relationships: [
          {
            foreignKeyName: "quiz_items_quiz_id_fkey"
            columns: ["quiz_id"]
            isOneToOne: false
            referencedRelation: "quizzes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quiz_items_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "questions"
            referencedColumns: ["id"]
          }
        ]
      }
      attempts: {
        Row: {
          id: string
          quiz_id: string
          user_id: string
          score: number
          meta: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          quiz_id: string
          user_id: string
          score: number
          meta?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          quiz_id?: string
          user_id?: string
          score?: number
          meta?: Json | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "attempts_quiz_id_fkey"
            columns: ["quiz_id"]
            isOneToOne: false
            referencedRelation: "quizzes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attempts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      usage_daily: {
        Row: {
          id: string
          user_id: string
          date: string
          count: number
        }
        Insert: {
          id?: string
          user_id: string
          date: string
          count?: number
        }
        Update: {
          id?: string
          user_id?: string
          date?: string
          count?: number
        }
        Relationships: [
          {
            foreignKeyName: "usage_daily_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      subscriptions: {
        Row: {
          user_id: string
          status: string
          stripe_customer_id: string | null
          stripe_sub_id: string | null
          current_period_end: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          user_id: string
          status: string
          stripe_customer_id?: string | null
          stripe_sub_id?: string | null
          current_period_end?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          user_id?: string
          status?: string
          stripe_customer_id?: string | null
          stripe_sub_id?: string | null
          current_period_end?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      answer_cache: {
        Row: {
          hash: string
          normalized_prompt: string
          answer: Json
          created_at: string
        }
        Insert: {
          hash: string
          normalized_prompt: string
          answer: Json
          created_at?: string
        }
        Update: {
          hash?: string
          normalized_prompt?: string
          answer?: Json
          created_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      source_type: 'paste' | 'upload' | 'import'
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}