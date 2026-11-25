import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { CertAppBanner } from '@/components/CertAppBanner'
import { getCertContent, getCertSlugs } from '@/lib/cert-content'
import { getExamInfo } from '@/lib/exam-info'
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
    title: `${cert.name} 필기 시험 정보 (문항 수, 합격 기준, 출제 단원) - JMK Contents`,
    description: `${cert.name} 필기 시험의 문항 수, 시험 시간, 합격 기준, 출제기준 단원을 정리했습니다.`,
    alternates: { canonical: `${SITE_URL}/exams/${bundle_id}/info` },
  }
}

export default async function ExamInfoPage({ params }: PageProps) {
  const { bundle_id } = await params
  const cert = await getCertContent(bundle_id)
  if (!cert) notFound()

  const info = await getExamInfo(bundle_id)
  const { exam } = cert
  const subjects = cert.subjects.length > 1 ? cert.subjects : ['']

  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl">
      <div className="mb-6 text-sm text-muted-foreground">
        <Link href="/exams" className="hover:text-foreground">자격증 과목</Link>
        {' / '}
        <Link href={`/exams/${bundle_id}`} className="hover:text-foreground">{cert.name}</Link>
        {' / '}
        <span className="text-foreground">시험 정보</span>
      </div>

      <h1 className="text-3xl font-bold mb-8">{cert.name} 필기 시험 정보</h1>

      <section className="mb-10">
        <h2 className="text-xl font-bold mb-4">시험 형식</h2>
        <dl className="grid grid-cols-[8rem_1fr] gap-y-2 rounded-xl border p-5">
          <dt className="text-muted-foreground">문항 수</dt>
          <dd>{exam.question_count}문항 (객관식)</dd>
          <dt className="text-muted-foreground">시험 시간</dt>
          <dd>{exam.time_limit_min}분</dd>
          <dt className="text-muted-foreground">합격 기준</dt>
          <dd>
            {cert.subjects.length > 1
              ? '과목당 40점 이상, 전 과목 평균 60점 이상 (100점 만점)'
              : `100점 만점에 60점 이상 (${exam.pass_count}문항 이상 정답)`}
          </dd>
          <dt className="text-muted-foreground">시행처</dt>
          <dd>
            <a href={cert.authority.url} target="_blank" rel="noopener noreferrer" className="underline underline-offset-4">
              {cert.authority.name}
            </a>
          </dd>
        </dl>
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-bold mb-4">시험 일정과 접수</h2>
        {info && info.schedules.length > 0 ? (
          <>
            <div className="overflow-x-auto rounded-xl border">
              <table className="w-full text-sm">
                <thead className="bg-muted/50 text-left">
                  <tr>
                    <th className="px-4 py-2">회차</th>
                    <th className="px-4 py-2">원서 접수</th>
                    <th className="px-4 py-2">시험</th>
                    <th className="px-4 py-2">합격자 발표</th>
                  </tr>
                </thead>
                <tbody>
                  {info.schedules.map((schedule) => (
                    <tr key={schedule.round} className="border-t">
                      <td className="px-4 py-2">{schedule.round}</td>
                      <td className="px-4 py-2">{schedule.apply}</td>
                      <td className="px-4 py-2">{schedule.exam}</td>
                      <td className="px-4 py-2">{schedule.result}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-3 text-sm text-muted-foreground">
              {info.verified_on} 확인. 일정은 바뀔 수 있으니 접수 전에{' '}
              <a href={info.source_url || cert.authority.url} target="_blank" rel="noopener noreferrer" className="underline underline-offset-4">
                시행처 공고
              </a>
              를 확인하세요.
            </p>
          </>
        ) : (
          <p className="rounded-xl border p-5 text-muted-foreground">
            시험 일정과 원서 접수 기간은{' '}
            <a href={cert.authority.url} target="_blank" rel="noopener noreferrer" className="underline underline-offset-4">
              {cert.authority.name}
            </a>
            에서 확인할 수 있습니다.
          </p>
        )}
        {info?.notes.map((note) => (
          <div key={note.title} className="mt-6">
            <h3 className="font-semibold mb-1">{note.title}</h3>
            <p className="whitespace-pre-wrap leading-relaxed">{note.body}</p>
          </div>
        ))}
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-bold mb-4">출제기준 단원</h2>
        {subjects.map((subject) => {
          const outline = cert.outline.filter((unit) => !subject || unit.subject === subject)
          if (outline.length === 0) return null

          return (
            <div key={subject || 'all'} className="mb-6">
              {subject && <h3 className="font-semibold mb-2">{subject}</h3>}
              <ul className="divide-y rounded-xl border">
                {outline.map((unit) => {
                  const hasQuestions = cert.units.some((entry) => entry.id === unit.id)

                  return (
                    <li key={unit.id} className="flex items-center justify-between gap-4 px-5 py-3">
                      {hasQuestions ? (
                        <Link href={`/exams/${bundle_id}/questions/${unit.id}`} className="underline underline-offset-4">
                          {unit.name}
                        </Link>
                      ) : (
                        <span>{unit.name}</span>
                      )}
                      {cert.weights_are_question_counts && unit.weight > 0 && (
                        <span className="shrink-0 text-sm text-muted-foreground">약 {unit.weight}문항</span>
                      )}
                    </li>
                  )
                })}
              </ul>
            </div>
          )
        })}
        {cert.weights_are_question_counts && (
          <p className="text-sm text-muted-foreground">
            단원별 문항 수는 출제기준과 기출 분석으로 추정한 값이며 회차마다 달라질 수 있습니다.
          </p>
        )}
      </section>

      <CertAppBanner name={cert.name} iosUrl={cert.ios_url} />
    </div>
  )
}
