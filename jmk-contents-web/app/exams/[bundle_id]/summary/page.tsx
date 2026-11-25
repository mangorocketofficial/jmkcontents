import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { CertAppBanner } from '@/components/CertAppBanner'
import { buildUnitSummary, getCertContent, getCertSlugs } from '@/lib/cert-content'
import { SITE_URL } from '@/lib/site'

interface PageProps {
  params: Promise<{ bundle_id: string }>
}

export const dynamicParams = false

export async function generateStaticParams() {
  return (await getCertSlugs()).map((bundle_id) => ({ bundle_id }))
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { bundle_id } = await params
  const cert = await getCertContent(bundle_id)
  if (!cert) return {}

  return {
    title: `${cert.name} 필기 핵심요약 (단원별 암기 포인트) - JMK Contents`,
    description: `${cert.name} 필기 시험 출제기준 단원별 핵심요약입니다. 시험 직전에 암기 포인트만 빠르게 훑어보세요.`,
    alternates: { canonical: `${SITE_URL}/exams/${bundle_id}/summary` },
  }
}

export default async function SummaryPage({ params }: PageProps) {
  const { bundle_id } = await params
  const cert = await getCertContent(bundle_id)
  if (!cert) notFound()

  const units = cert.units
    .map((unit) => ({ unit, groups: buildUnitSummary(unit) }))
    .filter(({ groups }) => groups.length > 0)

  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl">
      <div className="mb-6 text-sm text-muted-foreground">
        <Link href="/exams" className="hover:text-foreground">자격증 과목</Link>
        {' / '}
        <Link href={`/exams/${bundle_id}`} className="hover:text-foreground">{cert.name}</Link>
        {' / '}
        <span className="text-foreground">핵심요약</span>
      </div>

      <h1 className="text-3xl font-bold mb-3">{cert.name} 필기 핵심요약</h1>
      <p className="text-muted-foreground mb-8">
        예상문제 해설의 암기 포인트를 출제기준 단원별로 모았습니다.
      </p>

      <nav className="mb-10 rounded-xl border p-5">
        <p className="mb-3 text-sm font-medium">단원 바로 가기</p>
        <ul className="flex flex-wrap gap-x-4 gap-y-2 text-sm">
          {units.map(({ unit }) => (
            <li key={unit.id}>
              <a href={`#${unit.id}`} className="underline underline-offset-4">{unit.name}</a>
            </li>
          ))}
        </ul>
      </nav>

      {units.map(({ unit, groups }) => (
        <section key={unit.id} id={unit.id} className="mb-12 scroll-mt-6">
          <h2 className="text-2xl font-bold mb-1">{unit.name}</h2>
          <p className="mb-4 text-sm">
            <Link href={`/exams/${bundle_id}/questions/${unit.id}`} className="underline underline-offset-4">
              이 단원 예상문제 {unit.questions.length}문항 풀기
            </Link>
          </p>
          {groups.map((group) => (
            <div key={group.id} className="mb-6">
              {group.id !== unit.id && <h3 className="font-semibold mb-2">{group.name}</h3>}
              <ul className="list-disc space-y-1.5 pl-5 leading-relaxed">
                {group.points.map((point) => (
                  <li key={point} className="whitespace-pre-wrap">{point}</li>
                ))}
              </ul>
            </div>
          ))}
        </section>
      ))}

      <CertAppBanner name={cert.name} iosUrl={cert.ios_url} />
    </div>
  )
}
