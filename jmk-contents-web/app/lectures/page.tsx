import { getAllLectures, getApps } from '@/lib/firebase/apps'
import { AllLecturesClient } from '@/components/AllLecturesClient'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '영상강의 - JMK Contents',
  description: '모든 자격증 시험의 영상강의를 한곳에서 시청하세요.',
}

export const revalidate = 3600

export default async function AllLecturesPage() {
  const [allLectures, allApps] = await Promise.all([
    getAllLectures(),
    getApps(),
  ])

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-4">🎬 영상강의</h1>
        <p className="text-xl text-muted-foreground">
          {allApps.length}개 자격증 시험의 영상강의 {allLectures.length}개
        </p>
      </div>

      {allLectures.length > 0 ? (
        <AllLecturesClient lectures={allLectures} apps={allApps} />
      ) : (
        <div className="text-center py-12">
          <p className="text-lg text-muted-foreground">
            등록된 영상강의가 아직 없습니다.
          </p>
        </div>
      )}
    </div>
  )
}
