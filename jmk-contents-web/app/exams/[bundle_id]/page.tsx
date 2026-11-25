import { notFound } from 'next/navigation'
import { getAppByBundleId, getConceptsByAppId } from '@/lib/content'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { extractAppLegalInfo, getStoreLinkMetadata } from '@/lib/utils'
import Link from 'next/link'
import { CertTabs } from '@/components/CertTabs'
import { countQuestions, getCertContent, type CertContent } from '@/lib/cert-content'
import type { App } from '@/lib/firebase/types'

interface ExamPageProps {
  params: Promise<{
    bundle_id: string
  }>
}

export const revalidate = 3600

// 종목 정보(Firestore)를 못 읽어도 콘텐츠 DB에 있는 종목은 게시판을 연다.
function certAsApp(cert: CertContent | null): App | null {
  if (!cert) return null
  const now = new Date()

  return {
    bundle_id: cert.slug,
    app_name: cert.name,
    status: 'published',
    app_store_url: cert.ios_url,
    created_at: now,
    updated_at: now,
  }
}

export async function generateMetadata({ params }: ExamPageProps) {
  const { bundle_id } = await params
  const cert = await getCertContent(bundle_id)
  const app = (await getAppByBundleId(bundle_id)) || certAsApp(cert)

  if (!app) {
    return { title: '시험을 찾을 수 없습니다' }
  }

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
  const [storedApp, concepts, cert] = await Promise.all([
    getAppByBundleId(bundle_id),
    getConceptsByAppId(bundle_id),
    getCertContent(bundle_id),
  ])

  const app = storedApp || certAsApp(cert)

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

  const multiSubject = cert ? cert.subjects.length > 1 : false

  return (
    <div>
      <div className="mb-3 text-xs text-muted-foreground">
        <Link href="/exams" className="hover:underline">종목 목록</Link>
        {' › '}
        <span>{cert?.name || app.app_name}</span>
      </div>

      <div className="mb-4">
        <h1 className="text-xl font-bold">{cert?.name || app.app_name} 필기 공부방</h1>
        {descriptionInfo.cleanedText && (
          <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{descriptionInfo.cleanedText}</p>
        )}
      </div>

      {cert ? (
        <>
          <CertTabs slug={bundle_id} active="questions" />
          <table className="w-full text-sm">
            <thead className="border-b bg-muted/40 text-xs text-muted-foreground">
              <tr>
                <th className="w-12 px-2 py-2 font-normal">번호</th>
                {multiSubject && (
                  <th className="hidden w-48 px-2 py-2 text-left font-normal sm:table-cell">과목</th>
                )}
                <th className="px-2 py-2 text-left font-normal">단원</th>
                <th className="w-20 px-2 py-2 text-right font-normal">문항</th>
              </tr>
            </thead>
            <tbody>
              {cert.ios_url && (
                <tr className="border-b bg-muted/30">
                  <td className="px-2 py-2 text-center text-xs font-bold text-emerald-700">공지</td>
                  <td colSpan={multiSubject ? 3 : 2} className="px-2 py-2">
                    <a href={cert.ios_url} target="_blank" rel="noopener noreferrer" className="hover:underline">
                      기출 회차별 풀이와 모의고사는 {cert.name} 앱에서 볼 수 있습니다 (App Store)
                    </a>
                  </td>
                </tr>
              )}
              {cert.units.map((unit, index) => (
                <tr key={unit.id} className="border-b hover:bg-muted/30">
                  <td className="px-2 py-2 text-center text-xs text-muted-foreground tabular-nums">{index + 1}</td>
                  {multiSubject && (
                    <td className="hidden px-2 py-2 text-xs text-muted-foreground sm:table-cell">{unit.subject}</td>
                  )}
                  <td className="px-2 py-2">
                    <Link href={`/exams/${bundle_id}/questions/${unit.id}`} className="hover:underline">
                      {unit.name} 예상문제
                    </Link>
                  </td>
                  <td className="px-2 py-2 text-right tabular-nums">{unit.questions.length}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="mt-2 text-xs text-muted-foreground">
            단원 {cert.units.length}개, 예상문제 {countQuestions(cert).toLocaleString()}문항. 모든 문항에 정답과 해설이 있습니다.
          </p>
        </>
      ) : (
        <ul className="border-t border-foreground text-sm">
          <li className="border-b px-2 py-2">
            <Link href={`/exams/${bundle_id}/concepts`} className="hover:underline">
              {app.app_name} 핵심개념
            </Link>{' '}
            <span className="text-xs font-bold text-emerald-700">[{concepts.length}]</span>
          </li>
        </ul>
      )}

      {!cert && fullDescriptionInfo.cleanedText && (
        <section className="mt-8">
          <h2 className="border-b pb-1.5 text-sm font-bold">시험 소개</h2>
          <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
            {fullDescriptionInfo.cleanedText}
          </p>
        </section>
      )}

      {/* App Download - Secondary CTA */}
      <section className="mt-10">
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

    </div>
  )
}
