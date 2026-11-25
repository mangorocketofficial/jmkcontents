import type { Metadata } from 'next'
import { ConceptBoard } from '@/components/ConceptBoard'
import { getAllConcepts } from '@/lib/content'

export const metadata: Metadata = {
  title: '핵심개념 모아 보기 - JMK Contents',
  description: '자격증 종목별 필기 핵심개념을 한곳에서 찾아볼 수 있습니다.',
}

export const revalidate = 3600

export default async function AllConceptsPage() {
  const concepts = await getAllConcepts()

  return (
    <div>
      <h1 className="border-b border-foreground pb-2 text-lg font-bold">
        핵심개념 모아 보기{' '}
        <span className="text-sm font-normal text-muted-foreground">{concepts.length.toLocaleString()}개</span>
      </h1>
      <ConceptBoard concepts={concepts} showExam />
    </div>
  )
}
