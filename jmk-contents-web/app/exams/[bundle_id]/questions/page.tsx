import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { CertAppBanner } from '@/components/CertAppBanner'
import { countQuestions, getCertContent, getCertSlugs } from '@/lib/cert-content'
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
    title: `${cert.name} 필기 예상문제 ${countQuestions(cert)}문항 (해설 포함) - JMK Contents`,
    description: `${cert.name} 필기 예상문제를 출제기준 단원별로 풀어 보세요. 모든 문항에 정답과 해설이 있습니다.`,
    alternates: { canonical: `${SITE_URL}/exams/${bundle_id}/questions` },
  }
}

export default async function QuestionsIndexPage({ params }: PageProps) {
  const { bundle_id } = await params
  const cert = await getCertContent(bundle_id)
  if (!cert) notFound()

  const total = countQuestions(cert)
  const subjects = cert.subjects.length > 1 ? cert.subjects : ['']

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <div className="mb-6 text-sm text-muted-foreground">
        <Link href="/exams" className="hover:text-foreground">자격증 과목</Link>
        {' / '}
        <Link href={`/exams/${bundle_id}`} className="hover:text-foreground">{cert.name}</Link>
        {' / '}
        <span className="text-foreground">예상문제</span>
      </div>

      <h1 className="text-3xl font-bold mb-3">{cert.name} 필기 예상문제</h1>
      <p className="text-muted-foreground mb-8">
        출제기준 단원에 맞춰 만든 예상문제 {total.toLocaleString()}문항입니다. 문항마다 정답과 해설,
        오답 보기가 틀린 이유를 볼 수 있습니다.
      </p>

      {subjects.map((subject) => {
        const units = cert.units.filter((unit) => !subject || unit.subject === subject)
        if (units.length === 0) return null

        return (
          <section key={subject || 'all'} className="mb-10">
            {subject && <h2 className="text-xl font-bold mb-4">{subject}</h2>}
            <ul className="divide-y rounded-xl border">
              {units.map((unit) => (
                <li key={unit.id}>
                  <Link
                    href={`/exams/${bundle_id}/questions/${unit.id}`}
                    className="flex items-center justify-between gap-4 px-5 py-4 hover:bg-muted/50"
                  >
                    <span className="font-medium">{unit.name}</span>
                    <span className="shrink-0 text-sm text-muted-foreground">
                      {unit.questions.length}문항
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )
      })}

      <CertAppBanner name={cert.name} iosUrl={cert.ios_url} />
    </div>
  )
}
