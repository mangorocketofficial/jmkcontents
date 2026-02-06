import { notFound } from 'next/navigation'
import { getFirestoreDb } from '@/lib/firebase/admin'
import { COLLECTIONS } from '@/lib/firebase/types'
import { EditAffiliateAdForm } from '@/components/admin/EditAffiliateAdForm'

interface EditAffiliateAdPageProps {
  params: Promise<{
    id: string
  }>
}

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function EditAffiliateAdPage({ params }: EditAffiliateAdPageProps) {
  const { id } = await params

  const db = getFirestoreDb()
  const doc = await db.collection(COLLECTIONS.AFFILIATE_ADS).doc(id).get()

  if (!doc.exists) {
    notFound()
  }

  const data = doc.data()!
  const ad = {
    id: doc.id,
    type: data.type,
    title: data.title,
    imageUrl: data.imageUrl,
    linkUrl: data.linkUrl,
    isActive: data.isActive ?? true,
    priority: data.priority ?? 1,
    startDate: data.startDate || '',
    endDate: data.endDate || '',
    appIds: data.appIds ?? ['all'],
    impressions: data.impressions ?? 0,
    clicks: data.clicks ?? 0,
  }

  return <EditAffiliateAdForm ad={ad} />
}
