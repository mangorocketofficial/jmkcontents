import { NextResponse } from 'next/server'
import { getFirestoreDb } from '@/lib/firebase/admin'
import { COLLECTIONS } from '@/lib/firebase/types'

export async function GET() {
  try {
    const db = getFirestoreDb()
    const result: Record<string, unknown> = {}

    // 1. Apps
    const apps = await db.collection(COLLECTIONS.APPS).get()
    result.apps = {
      count: apps.size,
      items: apps.docs.map(doc => {
        const d = doc.data()
        return {
          bundle_id: doc.id,
          app_name: d.app_name,
          app_name_full: d.app_name_full,
          status: d.status,
          app_category: d.app_category,
          categories: d.categories,
          rating: d.rating,
          download_count: d.download_count,
          icon_url: d.icon_url ? 'yes' : 'no',
          app_store_url: d.app_store_url ? 'yes' : 'no',
        }
      })
    }

    // 2. Concepts
    const concepts = await db.collection(COLLECTIONS.CONCEPTS).get()
    const conceptsByApp: Record<string, { count: number; categories: string[]; sample: { id: string; title: string; category: string; importance: number }[] }> = {}
    concepts.docs.forEach(doc => {
      const d = doc.data()
      const appId = d.app_id || 'unknown'
      if (!conceptsByApp[appId]) conceptsByApp[appId] = { count: 0, categories: [], sample: [] }
      conceptsByApp[appId].count++
      if (!conceptsByApp[appId].categories.includes(d.category)) {
        conceptsByApp[appId].categories.push(d.category)
      }
      if (conceptsByApp[appId].sample.length < 5) {
        conceptsByApp[appId].sample.push({ id: doc.id, title: d.title, category: d.category, importance: d.importance })
      }
    })
    result.concepts = { total: concepts.size, byApp: conceptsByApp }

    // 3. Lectures
    const lectures = await db.collection(COLLECTIONS.LECTURES).get()
    const lecturesByApp: Record<string, { count: number; categories: string[]; sample: { id: string; title: string; category: string; duration: number }[] }> = {}
    lectures.docs.forEach(doc => {
      const d = doc.data()
      const appId = d.app_id || 'unknown'
      if (!lecturesByApp[appId]) lecturesByApp[appId] = { count: 0, categories: [], sample: [] }
      lecturesByApp[appId].count++
      if (d.category && !lecturesByApp[appId].categories.includes(d.category)) {
        lecturesByApp[appId].categories.push(d.category)
      }
      if (lecturesByApp[appId].sample.length < 5) {
        lecturesByApp[appId].sample.push({ id: doc.id, title: d.title, category: d.category, duration: d.duration_seconds })
      }
    })
    result.lectures = { total: lectures.size, byApp: lecturesByApp }

    // 4. Contact Submissions
    const contacts = await db.collection(COLLECTIONS.CONTACT_SUBMISSIONS).get()
    result.contactSubmissions = {
      count: contacts.size,
      items: contacts.docs.map(doc => {
        const d = doc.data()
        return { id: doc.id, subject: d.subject, status: d.status }
      })
    }

    // 5. Affiliate Ads
    const ads = await db.collection(COLLECTIONS.AFFILIATE_ADS).get()
    result.affiliateAds = {
      count: ads.size,
      items: ads.docs.map(doc => {
        const d = doc.data()
        return { id: doc.id, title: d.title, type: d.type, isActive: d.isActive, impressions: d.impressions, clicks: d.clicks }
      })
    }

    return NextResponse.json(result, { status: 200 })
  } catch (error) {
    console.error('Error checking data:', error)
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}
