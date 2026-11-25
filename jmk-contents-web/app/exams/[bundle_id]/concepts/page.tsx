import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getAppByBundleId, getConceptsByAppId } from '@/lib/content'
import { ConceptBoard } from '@/components/ConceptBoard'
import { CertTabs } from '@/components/CertTabs'
import { getCertContent } from '@/lib/cert-content'

interface ConceptsPageProps {
  params: Promise<{
    bundle_id: string
  }>
}

export const revalidate = 3600

export async function generateMetadata({ params }: ConceptsPageProps) {
  const { bundle_id } = await params
  const app = await getAppByBundleId(bundle_id)

  if (!app) {
    return {
      title: '시험을 찾을 수 없습니다',
    }
  }

  const description = `${app.app_name_full || app.app_name} 시험의 핵심 개념을 정리했습니다.`

  return {
    title: `핵심 개념 - ${app.app_name} - JMK Contents`,
    description,
    openGraph: {
      title: `${app.app_name} 핵심 개념`,
      description,
      url: `https://jmkcontents.com/exams/${bundle_id}/concepts`,
      type: 'website',
    },
  }
}

export default async function ConceptsPage({ params }: ConceptsPageProps) {
  const { bundle_id } = await params
  const [app, concepts, cert] = await Promise.all([
    getAppByBundleId(bundle_id),
    getConceptsByAppId(bundle_id),
    getCertContent(bundle_id),
  ])

  if (!app) {
    notFound()
  }

  return (
    <div>
      <div className="mb-3 text-xs text-muted-foreground">
        <Link href="/exams" className="hover:underline">종목 목록</Link>
        {' › '}
        <Link href={`/exams/${bundle_id}`} className="hover:underline">{app.app_name}</Link>
        {' › '}
        <span>핵심개념</span>
      </div>

      {cert && <CertTabs slug={bundle_id} active="concepts" />}

      <h1 className="border-b border-foreground pb-2 text-lg font-bold">
        {app.app_name} 핵심개념{' '}
        <span className="text-sm font-normal text-muted-foreground">{concepts.length.toLocaleString()}개</span>
      </h1>
      <ConceptBoard concepts={concepts} />
    </div>
  )
}
