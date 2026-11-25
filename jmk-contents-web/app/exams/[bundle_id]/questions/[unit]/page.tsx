import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { CertTabs } from '@/components/CertTabs'
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
    <div>
      <div className="mb-3 text-xs text-muted-foreground">
        <Link href="/exams" className="hover:underline">종목 목록</Link>
        {' › '}
        <Link href={`/exams/${bundle_id}`} className="hover:underline">{cert.name}</Link>
        {' › '}
        <span>예상문제</span>
      </div>

      <CertTabs slug={bundle_id} active="questions" />

      <div className="border-b border-foreground pb-3">
        <h1 className="text-lg font-bold">
          {cert.name} {unit.name} 예상문제
        </h1>
        <p className="mt-1 text-xs text-muted-foreground">
          {unit.subject && cert.subjects.length > 1 ? `${unit.subject} · ` : ''}
          {unit.questions.length}문항 ·{' '}
          <Link href={`/exams/${bundle_id}/summary#${unit.id}`} className="underline underline-offset-2">
            이 단원 핵심요약
          </Link>
        </p>
      </div>

      <ol className="text-[15px] leading-relaxed">
        {unit.questions.map((question, questionIndex) => (
          <li key={question.id} id={question.id} className="border-b py-5">
            {subunitNames.has(question.unit_id) && (
              <p className="mb-1 text-xs text-muted-foreground">[{subunitNames.get(question.unit_id)}]</p>
            )}
            <p className="font-medium whitespace-pre-wrap">
              <span className="text-emerald-700">{questionIndex + 1}.</span> {question.stem}
            </p>
            <ul className="mt-2 space-y-1 pl-1">
              {question.choices.map((choice, choiceIndex) => (
                <li key={choiceIndex} className="whitespace-pre-wrap">
                  {CIRCLED[choiceIndex] || `${choiceIndex + 1}.`} {choice}
                </li>
              ))}
            </ul>
            <details className="mt-3 border bg-muted/40 px-3 py-2">
              <summary className="cursor-pointer text-sm font-medium">정답과 해설 보기</summary>
              <div className="mt-2 space-y-2 text-sm leading-relaxed">
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
                  <p className="border bg-background px-3 py-2">
                    <strong className="text-emerald-700">암기 포인트</strong> {question.point}
                  </p>
                )}
              </div>
            </details>
          </li>
        ))}
      </ol>

      <CertAppBanner name={cert.name} iosUrl={cert.ios_url} />

      <table className="w-full border-t border-foreground text-sm">
        <tbody>
          {next && (
            <tr className="border-b">
              <td className="w-16 px-2 py-2 text-xs text-muted-foreground">다음 단원</td>
              <td className="px-2 py-2">
                <Link href={`/exams/${bundle_id}/questions/${next.id}`} className="hover:underline">
                  {next.name} 예상문제
                </Link>{' '}
                <span className="text-xs font-bold text-emerald-700">[{next.questions.length}]</span>
              </td>
            </tr>
          )}
          {previous && (
            <tr className="border-b">
              <td className="w-16 px-2 py-2 text-xs text-muted-foreground">이전 단원</td>
              <td className="px-2 py-2">
                <Link href={`/exams/${bundle_id}/questions/${previous.id}`} className="hover:underline">
                  {previous.name} 예상문제
                </Link>{' '}
                <span className="text-xs font-bold text-emerald-700">[{previous.questions.length}]</span>
              </td>
            </tr>
          )}
        </tbody>
      </table>
      <p className="mt-3">
        <Link href={`/exams/${bundle_id}`} className="inline-block border px-3 py-1.5 text-sm hover:bg-muted/50">
          목록
        </Link>
      </p>
    </div>
  )
}
