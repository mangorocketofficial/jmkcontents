import { notFound } from 'next/navigation'
import { getAppByBundleId, getConceptsByAppId, getLecturesByAppId } from '@/lib/firebase/apps'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'

interface ExamPageProps {
  params: Promise<{
    bundle_id: string
  }>
}

export const revalidate = 3600

export async function generateMetadata({ params }: ExamPageProps) {
  const { bundle_id } = await params
  const app = await getAppByBundleId(bundle_id)

  if (!app) {
    return { title: '시험을 찾을 수 없습니다' }
  }

  return {
    title: `${app.app_name} - 핵심개념 & 영상강의 - JMK Contents`,
    description: `${app.app_name_full || app.app_name} 자격증 시험 핵심개념과 영상강의`,
    openGraph: {
      title: `${app.app_name} 자격증 시험 학습`,
      description: `${app.app_name_full || app.app_name} 핵심개념과 영상강의`,
      url: `https://jmkcontents.com/exams/${bundle_id}`,
      type: 'website',
      ...(app.icon_url ? { images: [{ url: app.icon_url }] } : {}),
    },
  }
}

export default async function ExamPage({ params }: ExamPageProps) {
  const { bundle_id } = await params
  const [app, concepts, lectures] = await Promise.all([
    getAppByBundleId(bundle_id),
    getConceptsByAppId(bundle_id),
    getLecturesByAppId(bundle_id),
  ])

  if (!app) {
    notFound()
  }

  const appStoreUrl = app.app_store_url
    || `https://apps.apple.com/search?term=${encodeURIComponent(app.app_name_full || app.app_name)}`

  return (
    <div className="container mx-auto px-4 py-12">
      {/* Breadcrumb */}
      <div className="mb-6 text-sm text-muted-foreground">
        <Link href="/exams" className="hover:text-foreground">
          자격증 과목
        </Link>
        {' / '}
        <span className="text-foreground">{app.app_name}</span>
      </div>

      {/* Exam Header */}
      <div className="mb-12">
        <div className="flex flex-col md:flex-row gap-6 items-start">
          {app.icon_url && (
            <div className="flex-shrink-0">
              <img
                src={app.icon_url}
                alt={app.app_name}
                className="w-20 h-20 rounded-xl shadow-md object-cover"
              />
            </div>
          )}
          <div className="flex-1">
            <h1 className="text-4xl font-bold mb-2">{app.app_name}</h1>
            {app.app_name_full && app.app_name_full !== app.app_name && (
              <p className="text-xl text-muted-foreground mb-3">
                {app.app_name_full}
              </p>
            )}

            <div className="flex flex-wrap gap-2 mb-4">
              {app.app_category && (
                <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                  {app.app_category}
                </span>
              )}
              {app.categories && app.categories.map((category) => (
                <span
                  key={category}
                  className="px-3 py-1 bg-secondary text-secondary-foreground rounded-full text-sm"
                >
                  {category}
                </span>
              ))}
            </div>

            {app.description && (
              <p className="text-muted-foreground">{app.description}</p>
            )}
          </div>
        </div>
      </div>

      {/* Learning Content - Primary */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-6">학습 자료</h2>
        <div className={`grid grid-cols-1 ${lectures.length > 0 ? 'md:grid-cols-2' : ''} gap-6`}>
          <Link href={`/exams/${bundle_id}/concepts`}>
            <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full border-2 hover:border-primary/50">
              <CardHeader>
                <div className="text-4xl mb-2">💡</div>
                <CardTitle className="text-xl">핵심 개념</CardTitle>
                <CardDescription className="text-base">
                  {concepts.length > 0
                    ? `${concepts.length}개의 핵심 개념을 정리했습니다`
                    : '시험에 자주 나오는 핵심 개념을 정리했습니다'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full">핵심개념 보기</Button>
              </CardContent>
            </Card>
          </Link>
          {lectures.length > 0 && (
            <Link href={`/exams/${bundle_id}/lectures`}>
              <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full border-2 hover:border-primary/50">
                <CardHeader>
                  <div className="text-4xl mb-2">🎬</div>
                  <CardTitle className="text-xl">영상 강의</CardTitle>
                  <CardDescription className="text-base">
                    {lectures.length}개의 영상 강의로 효과적으로 학습하세요
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full">영상강의 보기</Button>
                </CardContent>
              </Card>
            </Link>
          )}
        </div>
      </section>

      {/* App Description */}
      {app.description_full && (
        <section className="mb-12">
          <Card>
            <CardHeader>
              <CardTitle>시험 소개</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-base leading-relaxed whitespace-pre-wrap text-muted-foreground">
                {app.description_full}
              </p>
            </CardContent>
          </Card>
        </section>
      )}

      {/* App Download - Secondary CTA */}
      <section className="border-t pt-8">
        <Card className="bg-muted/30">
          <CardHeader>
            <CardTitle>📱 기출문제 앱 다운받기</CardTitle>
            <CardDescription>
              {app.app_name} 기출문제를 앱에서 풀어보세요
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap items-center gap-4">
            {app.icon_url && (
              <img src={app.icon_url} alt="" className="w-12 h-12 rounded-lg" />
            )}
            <a href={appStoreUrl} target="_blank" rel="noopener noreferrer">
              <Button variant="outline" className="gap-2">
                <span>🍎</span>
                App Store에서 다운로드
              </Button>
            </a>
            {app.rating !== undefined && app.rating > 0 && (
              <span className="text-sm text-muted-foreground">
                ⭐ {app.rating.toFixed(1)}
                {app.review_count !== undefined && app.review_count > 0 && (
                  <span> ({app.review_count.toLocaleString()})</span>
                )}
              </span>
            )}
          </CardContent>
        </Card>
      </section>

      {/* Support Links */}
      <section className="mt-8">
        <Card>
          <CardHeader>
            <CardTitle>도움이 필요하신가요?</CardTitle>
            <CardDescription>
              문의사항이 있으시면 언제든지 연락해 주세요
            </CardDescription>
          </CardHeader>
          <CardContent className="flex gap-4">
            <Link href="/support">
              <Button variant="outline">고객 지원</Button>
            </Link>
            <Link href="/contact">
              <Button variant="outline">문의하기</Button>
            </Link>
          </CardContent>
        </Card>
      </section>
    </div>
  )
}
