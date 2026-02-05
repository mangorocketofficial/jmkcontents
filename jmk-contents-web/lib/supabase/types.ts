export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      apps: {
        Row: {
          id: string
          bundle_id: string
          app_name: string
          app_name_full: string | null
          description: string | null
          keywords: string[] | null
          icon_url: string | null
          app_store_url: string | null
          status: 'draft' | 'published' | 'archived'
          categories: string[] | null
          privacy_url: string
          support_url: string
          marketing_url: string | null
          download_count: number
          rating: number | null
          review_count: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          bundle_id: string
          app_name: string
          app_name_full?: string | null
          description?: string | null
          keywords?: string[] | null
          icon_url?: string | null
          app_store_url?: string | null
          status?: 'draft' | 'published' | 'archived'
          categories?: string[] | null
          privacy_url?: string
          support_url?: string
          marketing_url?: string | null
          download_count?: number
          rating?: number | null
          review_count?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          bundle_id?: string
          app_name?: string
          app_name_full?: string | null
          description?: string | null
          keywords?: string[] | null
          icon_url?: string | null
          app_store_url?: string | null
          status?: 'draft' | 'published' | 'archived'
          categories?: string[] | null
          privacy_url?: string
          support_url?: string
          marketing_url?: string | null
          download_count?: number
          rating?: number | null
          review_count?: number
          created_at?: string
          updated_at?: string
        }
      }
      concepts: {
        Row: {
          id: string
          app_id: string
          category: string
          title: string
          content: string
          importance: 'high' | 'medium' | 'low' | null
          related_questions: number[] | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          app_id: string
          category: string
          title: string
          content: string
          importance?: 'high' | 'medium' | 'low' | null
          related_questions?: number[] | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          app_id?: string
          category?: string
          title?: string
          content?: string
          importance?: 'high' | 'medium' | 'low' | null
          related_questions?: number[] | null
          created_at?: string
          updated_at?: string
        }
      }
      lectures: {
        Row: {
          id: string
          app_id: string
          category: string
          title: string
          audio_url: string | null
          transcript: string | null
          duration: number | null
          created_at: string
        }
        Insert: {
          id?: string
          app_id: string
          category: string
          title: string
          audio_url?: string | null
          transcript?: string | null
          duration?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          app_id?: string
          category?: string
          title?: string
          audio_url?: string | null
          transcript?: string | null
          duration?: number | null
          created_at?: string
        }
      }
      contact_submissions: {
        Row: {
          id: string
          app_id: string | null
          name: string | null
          email: string
          subject: string | null
          message: string
          status: 'new' | 'replied' | 'closed'
          created_at: string
        }
        Insert: {
          id?: string
          app_id?: string | null
          name?: string | null
          email: string
          subject?: string | null
          message: string
          status?: 'new' | 'replied' | 'closed'
          created_at?: string
        }
        Update: {
          id?: string
          app_id?: string | null
          name?: string | null
          email?: string
          subject?: string | null
          message?: string
          status?: 'new' | 'replied' | 'closed'
          created_at?: string
        }
      }
    }
  }
}
