import { createClient } from '@/lib/supabase/server'
import { Database } from '@/lib/supabase/types'

export type ContactSubmission =
  Database['public']['Tables']['contact_submissions']['Insert']

/**
 * 문의사항 제출
 */
export async function submitContactForm(
  submission: ContactSubmission
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()

  const { error } = await supabase.from('contact_submissions').insert({
    ...submission,
    status: 'new',
  })

  if (error) {
    console.error('Error submitting contact form:', error)
    return {
      success: false,
      error: error.message,
    }
  }

  return { success: true }
}

/**
 * 문의사항 목록 가져오기 (관리자용)
 */
export async function getContactSubmissions() {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('contact_submissions')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching contact submissions:', error)
    return []
  }

  return data || []
}
