import { getAppsWithContentCounts } from '@/lib/firebase/apps'
import { ExamsClient } from '@/components/ExamsClient'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '자격증 과목 - JMK Contents',
  description: '자격증 시험 준비를 위한 핵심개념과 영상강의를 제공합니다.',
}

export const revalidate = 3600

export default async function ExamsPage() {
  const examsWithCounts = await getAppsWithContentCounts()

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-4">자격증 과목</h1>
        <p className="text-xl text-muted-foreground">
          {examsWithCounts.length}개 자격증 시험의 핵심개념과 영상강의
        </p>
      </div>

      {examsWithCounts.length > 0 ? (
        <ExamsClient exams={examsWithCounts} />
      ) : (
        <div className="text-center py-12">
          <p className="text-lg text-muted-foreground">
            등록된 자격증 과목이 아직 없습니다.
          </p>
        </div>
      )}
    </div>
  )
}
