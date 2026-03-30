import { getAllConcepts, getApps } from '@/lib/content'
import { AllConceptsClient } from '@/components/AllConceptsClient'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '핵심개념 - JMK Contents',
  description: '모든 자격증 시험의 핵심개념을 한곳에서 학습하세요.',
}

export const revalidate = 3600

export default async function AllConceptsPage() {
  const [allConcepts, allApps] = await Promise.all([
    getAllConcepts(),
    getApps(),
  ])

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-4">💡 핵심개념</h1>
        <p className="text-xl text-muted-foreground">
          {allApps.length}개 자격증 시험의 핵심개념 {allConcepts.length}개
        </p>
      </div>

      {allConcepts.length > 0 ? (
        <AllConceptsClient concepts={allConcepts} apps={allApps} />
      ) : (
        <div className="text-center py-12">
          <p className="text-lg text-muted-foreground">
            등록된 핵심개념이 아직 없습니다.
          </p>
        </div>
      )}
    </div>
  )
}
