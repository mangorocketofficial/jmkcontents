import { ExamCard } from '@/components/ExamCard'
import { Button } from '@/components/ui/button'
import { getAppsWithContentCounts, getAllConcepts, getAllLectures } from '@/lib/firebase/apps'
import { ConceptCard } from '@/components/ConceptCard'
import Link from 'next/link'

export const revalidate = 3600

export default async function Home() {
  const [examsWithCounts, recentConcepts, recentLectures] = await Promise.all([
    getAppsWithContentCounts(),
    getAllConcepts(),
    getAllLectures(),
  ])

  const featuredExams = examsWithCounts
    .filter(e => e.is_featured)
    .slice(0, 3)

  const displayExams = featuredExams.length > 0
    ? featuredExams
    : examsWithCounts.slice(0, 3)

  const totalConcepts = recentConcepts.length
  const totalLectures = recentLectures.length

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Hero Section */}
      <section className="text-center py-16 space-y-4">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
          자격증 시험 핵심개념 & 영상강의
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          {examsWithCounts.length}개 자격증 시험의 핵심개념 {totalConcepts}개, 영상강의 {totalLectures}개로 효과적으로 준비하세요
        </p>
        <div className="flex gap-4 justify-center pt-4">
          <Link href="/exams">
            <Button size="lg">자격증 과목 보기</Button>
          </Link>
          <Link href="/concepts">
            <Button size="lg" variant="outline">핵심개념 보기</Button>
          </Link>
        </div>
      </section>

      {/* Featured Exams Section */}
      <section className="py-12">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold">인기 자격증 과목</h2>
          <Link href="/exams">
            <Button variant="ghost">전체 보기 →</Button>
          </Link>
        </div>
        {displayExams.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayExams.map((exam) => (
              <ExamCard
                key={exam.bundle_id}
                app={exam}
                conceptCount={exam.conceptCount}
                lectureCount={exam.lectureCount}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              등록된 자격증 과목이 아직 없습니다. 곧 업데이트될 예정입니다.
            </p>
          </div>
        )}
      </section>

      {/* Recent Concepts Preview */}
      {recentConcepts.length > 0 && (
        <section className="py-12">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold">최신 핵심개념</h2>
            <Link href="/concepts">
              <Button variant="ghost">전체 보기 →</Button>
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recentConcepts.slice(0, 3).map((concept) => (
              <div key={concept.id}>
                <div className="text-xs text-muted-foreground mb-1 px-1">{concept.app_name}</div>
                <ConceptCard concept={concept} />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Features Section */}
      <section className="py-12 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="text-center space-y-2">
          <div className="text-4xl mb-4">💡</div>
          <h3 className="text-xl font-bold">핵심개념 정리</h3>
          <p className="text-muted-foreground">
            시험에 자주 나오는 핵심 개념을 체계적으로 정리했습니다
          </p>
        </div>
        <div className="text-center space-y-2">
          <div className="text-4xl mb-4">🎬</div>
          <h3 className="text-xl font-bold">영상강의</h3>
          <p className="text-muted-foreground">
            전문 영상 강의로 어려운 개념도 쉽게 이해하세요
          </p>
        </div>
        <div className="text-center space-y-2">
          <div className="text-4xl mb-4">📱</div>
          <h3 className="text-xl font-bold">기출문제 앱</h3>
          <p className="text-muted-foreground">
            실제 시험 기출문제를 앱으로 풀어볼 수 있습니다
          </p>
        </div>
      </section>
    </div>
  )
}
