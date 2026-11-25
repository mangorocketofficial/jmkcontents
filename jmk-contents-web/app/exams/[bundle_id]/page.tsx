import { notFound } from 'next/navigation'
import { getAppByBundleId, getConceptsByAppId } from '@/lib/content'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { extractAppLegalInfo, getStoreLinkMetadata } from '@/lib/utils'
import Link from 'next/link'
import { countQuestions, getCertContent } from '@/lib/cert-content'

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

  const cert = await getCertContent(bundle_id)

  return {
    title: cert
      ? `${cert.name} 필기 예상문제·핵심요약·시험 정보 - JMK Contents`
      : `${app.app_name} - 핵심개념 - JMK Contents`,
    description: cert
      ? `${cert.name} 필기 예상문제 ${countQuestions(cert).toLocaleString()}문항과 해설, 단원별 핵심요약, 시험 정보`
      : `${app.app_name_full || app.app_name} 자격증 시험 핵심개념`,
    openGraph: {
      title: `${app.app_name} 자격증 시험 학습`,
      description: `${app.app_name_full || app.app_name} 핵심개념`,
      url: `https://jmkcontents.com/exams/${bundle_id}`,
      type: 'website',
      ...(app.icon_url ? { images: [{ url: app.icon_url }] } : {}),
    },
  }
}

export default async function ExamPage({ params }: ExamPageProps) {
  const { bundle_id } = await params
  const [app, concepts, cert] = await Promise.all([
    getAppByBundleId(bundle_id),
    getConceptsByAppId(bundle_id),
    getCertContent(bundle_id),
  ])

  if (!app) {
    notFound()
  }

  const appStoreUrl = app.app_store_url
    || `https://apps.apple.com/search?term=${encodeURIComponent(app.app_name_full || app.app_name)}`
  const storeLinkMetadata = getStoreLinkMetadata(app.app_store_url || appStoreUrl)
  const descriptionInfo = extractAppLegalInfo(app.description)
  const fullDescriptionInfo = extractAppLegalInfo(app.description_full)
  const termsOfUseUrl = descriptionInfo.termsOfUseUrl || fullDescriptionInfo.termsOfUseUrl
  const privacyPolicyUrl = descriptionInfo.privacyPolicyUrl || fullDescriptionInfo.privacyPolicyUrl

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

            {descriptionInfo.cleanedText && (
              <p className="text-muted-foreground whitespace-pre-wrap">{descriptionInfo.cleanedText}</p>
            )}
          </div>
        </div>
      </div>

      {/* Learning Content - Primary */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-6">학습 자료</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {cert && (
            <>
              <Link href={`/exams/${bundle_id}/questions`}>
                <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full border-2 hover:border-primary/50">
                  <CardHeader>
                    <div className="text-4xl mb-2">📝</div>
                    <CardTitle className="text-xl">예상문제</CardTitle>
                    <CardDescription className="text-base">
                      단원별 예상문제 {countQuestions(cert).toLocaleString()}문항과 해설
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button className="w-full">예상문제 풀기</Button>
                  </CardContent>
                </Card>
              </Link>
              <Link href={`/exams/${bundle_id}/summary`}>
                <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full border-2 hover:border-primary/50">
                  <CardHeader>
                    <div className="text-4xl mb-2">📌</div>
                    <CardTitle className="text-xl">핵심요약</CardTitle>
                    <CardDescription className="text-base">
                      시험 직전에 훑어보는 단원별 암기 포인트
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button className="w-full" variant="outline">핵심요약 보기</Button>
                  </CardContent>
                </Card>
              </Link>
              <Link href={`/exams/${bundle_id}/info`}>
                <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full border-2 hover:border-primary/50">
                  <CardHeader>
                    <div className="text-4xl mb-2">🗓️</div>
                    <CardTitle className="text-xl">시험 정보</CardTitle>
                    <CardDescription className="text-base">
                      문항 수, 합격 기준, 출제기준 단원
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button className="w-full" variant="outline">시험 정보 보기</Button>
                  </CardContent>
                </Card>
              </Link>
            </>
          )}
          {(concepts.length > 0 || !cert) && (
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
                <Button className="w-full" variant={cert ? 'outline' : 'default'}>핵심개념 보기</Button>
              </CardContent>
            </Card>
          </Link>
          )}
        </div>
      </section>

      {/* App Description */}
      {fullDescriptionInfo.cleanedText && (
        <section className="mb-12">
          <Card>
            <CardHeader>
              <CardTitle>시험 소개</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-base leading-relaxed whitespace-pre-wrap text-muted-foreground">
                {fullDescriptionInfo.cleanedText}
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
          <CardContent className="space-y-4">
            <div className="flex flex-wrap items-center gap-4">
              {app.icon_url && (
                <img src={app.icon_url} alt="" className="w-12 h-12 rounded-lg" />
              )}
              <a href={appStoreUrl} target="_blank" rel="noopener noreferrer">
                <Button variant="outline" className="gap-2">
                  <span>{storeLinkMetadata.icon}</span>
                  {storeLinkMetadata.label}
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
            </div>

            {(termsOfUseUrl || privacyPolicyUrl) && (
              <div className="border-t pt-4 text-sm text-muted-foreground flex flex-wrap items-center gap-4">
                <span className="font-medium">법률 안내</span>
                {termsOfUseUrl && (
                  <a
                    href={termsOfUseUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline underline-offset-4 hover:text-foreground"
                  >
                    이용약관 (EULA)
                  </a>
                )}
                {privacyPolicyUrl && (
                  <a
                    href={privacyPolicyUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline underline-offset-4 hover:text-foreground"
                  >
                    개인정보 처리방침
                  </a>
                )}
              </div>
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
