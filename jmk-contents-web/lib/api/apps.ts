import { createClient } from '@/lib/supabase/server'
import { Database } from '@/lib/supabase/types'

export type App = Database['public']['Tables']['apps']['Row']
export type Concept = Database['public']['Tables']['concepts']['Row']
export type Lecture = Database['public']['Tables']['lectures']['Row']

/**
 * 모든 published 앱 목록 가져오기
 */
export async function getApps(): Promise<App[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('apps')
    .select('*')
    .eq('status', 'published')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching apps:', error)
    return []
  }

  return data || []
}

/**
 * 추천 앱 목록 가져오기 (평점 높은 순, 최대 3개)
 */
export async function getFeaturedApps(): Promise<App[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('apps')
    .select('*')
    .eq('status', 'published')
    .not('rating', 'is', null)
    .order('rating', { ascending: false })
    .order('download_count', { ascending: false })
    .limit(3)

  if (error) {
    console.error('Error fetching featured apps:', error)
    return []
  }

  return data || []
}

/**
 * bundle_id로 특정 앱 가져오기
 */
export async function getAppByBundleId(bundleId: string): Promise<App | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('apps')
    .select('*')
    .eq('bundle_id', bundleId)
    .eq('status', 'published')
    .single()

  if (error) {
    console.error('Error fetching app:', error)
    return null
  }

  return data
}

/**
 * 카테고리별 앱 필터링
 */
export async function getAppsByCategory(category: string): Promise<App[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('apps')
    .select('*')
    .eq('status', 'published')
    .contains('categories', [category])
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching apps by category:', error)
    return []
  }

  return data || []
}

/**
 * 앱의 학습 개념 가져오기
 */
export async function getConceptsByAppId(appId: string): Promise<Concept[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('concepts')
    .select('*')
    .eq('app_id', appId)
    .order('importance', { ascending: true }) // high, medium, low
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching concepts:', error)
    return []
  }

  return data || []
}

/**
 * 카테고리별 학습 개념 가져오기
 */
export async function getConceptsByCategory(
  appId: string,
  category: string
): Promise<Concept[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('concepts')
    .select('*')
    .eq('app_id', appId)
    .eq('category', category)
    .order('importance', { ascending: true })
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching concepts by category:', error)
    return []
  }

  return data || []
}

/**
 * 앱의 강의 목록 가져오기
 */
export async function getLecturesByAppId(appId: string): Promise<Lecture[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('lectures')
    .select('*')
    .eq('app_id', appId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching lectures:', error)
    return []
  }

  return data || []
}

/**
 * 카테고리별 강의 목록 가져오기
 */
export async function getLecturesByCategory(
  appId: string,
  category: string
): Promise<Lecture[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('lectures')
    .select('*')
    .eq('app_id', appId)
    .eq('category', category)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching lectures by category:', error)
    return []
  }

  return data || []
}

/**
 * 앱 통계 업데이트 (다운로드 수)
 */
export async function incrementDownloadCount(appId: string): Promise<void> {
  const supabase = await createClient()

  const { error } = await supabase.rpc('increment_download_count', {
    app_id: appId,
  })

  if (error) {
    console.error('Error incrementing download count:', error)
  }
}
