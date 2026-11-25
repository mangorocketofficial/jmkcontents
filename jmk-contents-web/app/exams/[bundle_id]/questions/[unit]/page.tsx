import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { CertAppBanner } from '@/components/CertAppBanner'
import { getCertContent, getCertSlugs } from '@/lib/cert-content'
import { SITE_URL } from '@/lib/site'

interface PageProps {
  params: Promise<{ bundle_id: string; unit: string }>
}

export const dynamicParams = false

export async function generateStaticParams() {
  const slugs = await getCertSlugs()
  const certs = await Promise.all(slugs.map((slug) => getCertContent(slug)))

  return certs.flatMap((cert) =>
    cert ? cert.units.map((unit) => ({ bundle_id: cert.slug, unit: unit.id })) : []
  )
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { bundle_id, unit: unitId } = await params
  const cert = await getCertContent(bundle_id)
  const unit = cert?.units.find((entry) => entry.id === unitId)
  if (!cert || !unit) return {}

  return {
    title: `${cert.name} ${unit.name} 예상문제 ${unit.questions.length}문항 - JMK Contents`,
    description: `${cert.name} 필기 「${unit.name}」 단원 예상문제 ${unit.questions.length}문항과 해설입니다.`,
    alternates: { canonical: `${SITE_URL}/exams/${bundle_id}/questions/${unit.id}` },
  }
}

const CIRCLED = ['①', '②', '③', '④', '⑤']

export default async function UnitQuestionsPage({ params }: PageProps) {
  const { bundle_id, unit: unitId } = await params
  const cert = await getCertContent(bundle_id)
  const index = cert ? cert.units.findIndex((entry) => entry.id === unitId) : -1
  if (!cert || index < 0) notFound()

  const unit = cert.units[index]
  const previous = cert.units[index - 1]
  const next = cert.units[index + 1]
  const subunitNames = new Map(unit.subunits.map((sub) => [sub.id, sub.name]))

  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl">
      <div className="mb-6 text-sm text-muted-foreground">
        <Link href={`/exams/${bundle_id}`} className="hover:text-foreground">{cert.name}</Link>
        {' / '}
        <Link href={`/exams/${bundle_id}/questions`} className="hover:text-foreground">예상문제</Link>
        {' / '}
        <span className="text-foreground">{unit.name}</span>
      </div>

      <h1 className="text-3xl font-bold mb-3">
        {cert.name} {unit.name} 예상문제
      </h1>
      <p className="text-muted-foreground mb-2">
        {unit.subject && cert.subjects.length > 1 ? `${unit.subject} 과목 · ` : ''}
        {unit.questions.length}문항. 「정답과 해설 보기」를 누르면 정답이 열립니다.
      </p>
      <p className="mb-8 text-sm">
        <Link href={`/exams/${bundle_id}/summary#${unit.id}`} className="underline underline-offset-4">
          이 단원 핵심요약 보기
        </Link>
      </p>

      <ol className="space-y-8">
        {unit.questions.map((question, questionIndex) => (
          <li key={question.id} id={question.id} className="rounded-xl border p-5">
            {subunitNames.has(question.unit_id) && (
              <p className="mb-2 text-xs text-muted-foreground">{subunitNames.get(question.unit_id)}</p>
            )}
            <p className="font-medium whitespace-pre-wrap">
              {questionIndex + 1}. {question.stem}
            </p>
            <ul className="mt-3 space-y-1.5">
              {question.choices.map((choice, choiceIndex) => (
                <li key={choiceIndex} className="whitespace-pre-wrap">
                  {CIRCLED[choiceIndex] || `${choiceIndex + 1}.`} {choice}
                </li>
              ))}
            </ul>
            <details className="mt-4 rounded-lg bg-muted/40 px-4 py-3">
              <summary className="cursor-pointer text-sm font-medium">정답과 해설 보기</summary>
              <div className="mt-3 space-y-3 text-sm leading-relaxed">
                <p>
                  <strong>정답 {CIRCLED[question.answer - 1] || question.answer}</strong>
                </p>
                {question.basis && <p className="whitespace-pre-wrap">{question.basis}</p>}
                {Object.keys(question.wrong).length > 0 && (
                  <ul className="space-y-1 text-muted-foreground">
                    {Object.entries(question.wrong).map(([number, reason]) => (
                      <li key={number} className="whitespace-pre-wrap">
                        {CIRCLED[Number(number) - 1] || number} {reason}
                      </li>
                    ))}
                  </ul>
                )}
                {question.point && (
                  <p className="rounded-md border bg-background px-3 py-2">
                    <strong>암기 포인트</strong> {question.point}
                  </p>
                )}
              </div>
            </details>
          </li>
        ))}
      </ol>

      <CertAppBanner name={cert.name} iosUrl={cert.ios_url} />

      <nav className="flex justify-between gap-4 text-sm">
        {previous ? (
          <Link href={`/exams/${bundle_id}/questions/${previous.id}`} className="underline underline-offset-4">
            ← {previous.name}
          </Link>
        ) : <span />}
        {next ? (
          <Link href={`/exams/${bundle_id}/questions/${next.id}`} className="text-right underline underline-offset-4">
            {next.name} →
          </Link>
        ) : <span />}
      </nav>
    </div>
  )
}
