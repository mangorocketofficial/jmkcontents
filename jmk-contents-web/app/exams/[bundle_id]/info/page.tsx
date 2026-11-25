import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { CertTabs } from '@/components/CertTabs'
import { CertAppBanner } from '@/components/CertAppBanner'
import { getCertContent, getCertSlugs } from '@/lib/cert-content'
import { formatRange, getExamInfo, groupRounds, type ExamRound } from '@/lib/exam-info'
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
    title: `${cert.name} 시험 일정·합격률·응시 방법 - JMK Contents`,
    description: `${cert.name} 필기 시험 일정, 원서 접수 기간, 합격률, 응시 방법, 출제기준 단원을 정리했습니다.`,
    alternates: { canonical: `${SITE_URL}/exams/${bundle_id}/info` },
  }
}

function ScheduleTable({ rounds }: { rounds: ExamRound[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[620px] text-sm">
        <thead className="border-y bg-muted/40 text-xs text-muted-foreground">
          <tr>
            <th className="px-2 py-2 text-left font-normal">회차</th>
            <th className="px-2 py-2 text-left font-normal">필기 접수</th>
            <th className="px-2 py-2 text-left font-normal">필기 시험</th>
            <th className="px-2 py-2 text-left font-normal">필기 발표</th>
            <th className="px-2 py-2 text-left font-normal">실기 접수</th>
            <th className="px-2 py-2 text-left font-normal">실기 시험</th>
            <th className="px-2 py-2 text-left font-normal">최종 발표</th>
          </tr>
        </thead>
        <tbody>
          {rounds.map((round) => (
            <tr key={`${round.year}-${round.round}`} className="border-b align-top tabular-nums">
              <td className="whitespace-nowrap px-2 py-2">
                {round.year}년 {round.round}회
              </td>
              <td className="px-2 py-2">
                {round.writtenApply.map((range) => (
                  <div key={range}>{range}</div>
                ))}
              </td>
              <td className="px-2 py-2">{formatRange(round.written.exam_start, round.written.exam_end)}</td>
              <td className="px-2 py-2">{formatRange(round.written.result, '')}</td>
              <td className="px-2 py-2">
                {round.practicalApply.length > 0 ? round.practicalApply.map((range) => <div key={range}>{range}</div>) : '-'}
              </td>
              <td className="px-2 py-2">
                {formatRange(round.practical.exam_start, round.practical.exam_end) || '-'}
              </td>
              <td className="px-2 py-2">{formatRange(round.practical.result, '') || '-'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default async function ExamInfoPage({ params }: PageProps) {
  const { bundle_id } = await params
  const cert = await getCertContent(bundle_id)
  if (!cert) notFound()

  const info = await getExamInfo(bundle_id)
  // 받은 날짜 이후에 필기시험이 끝나는 회차만 '남은 회차'로 본다(페이지는 배포할 때 만들어진다).
  const rounds = info ? groupRounds(info.schedules) : []
  const cutoff = info?.fetched_on || ''
  const upcoming = rounds.filter((round) => (round.written.exam_end || round.written.exam_start) >= cutoff)
  const past = rounds.filter((round) => !upcoming.includes(round))
  const { exam } = cert
  const subjects = cert.subjects.length > 1 ? cert.subjects : ['']

  return (
    <div>
      <div className="mb-3 text-xs text-muted-foreground">
        <Link href="/exams" className="hover:underline">종목 목록</Link>
        {' › '}
        <Link href={`/exams/${bundle_id}`} className="hover:underline">{cert.name}</Link>
        {' › '}
        <span>시험 정보</span>
      </div>

      <CertTabs slug={bundle_id} active="info" />

      <h1 className="mb-6 border-b border-foreground pb-3 text-lg font-bold">{cert.name} 필기 시험 정보</h1>

      <section className="mb-10">
        <h2 className="text-base font-bold mb-3">시험 형식</h2>
        <dl className="grid grid-cols-[8rem_1fr] gap-y-2 border p-5">
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
        <h2 className="text-base font-bold mb-3">시험 일정과 접수</h2>
        {rounds.length > 0 ? (
          <>
            {upcoming.length > 0 ? (
              <ScheduleTable rounds={upcoming} />
            ) : (
              <p className="border p-4 text-sm text-muted-foreground">
                {info?.fetched_on} 기준으로 공단에 등록된 일정 중 남은 필기 회차가 없습니다. 다음 해 일정은 공단이
                공고하면 반영합니다.
              </p>
            )}
            {past.length > 0 && (
              <details className="mt-3">
                <summary className="cursor-pointer text-sm text-muted-foreground">
                  지난 회차 {past.length}개 보기
                </summary>
                <div className="mt-2">
                  <ScheduleTable rounds={past} />
                </div>
              </details>
            )}
            <p className="mt-3 text-xs text-muted-foreground">
              {info?.source.name}에서 {info?.fetched_on}에 받은 자료입니다. 접수 기간이 둘 이상 적힌 회차는 공단이
              접수를 나눠 받는 경우입니다. 일정은 바뀔 수 있으니 접수 전에{' '}
              <a href={cert.authority.url} target="_blank" rel="noopener noreferrer" className="underline underline-offset-4">
                {cert.authority.name}
              </a>
              에서 확인하세요.
            </p>
          </>
        ) : (
          <p className="border p-4 text-sm text-muted-foreground">
            시험 일정과 원서 접수 기간은{' '}
            <a href={cert.authority.url} target="_blank" rel="noopener noreferrer" className="underline underline-offset-4">
              {cert.authority.name}
            </a>
            에서 확인할 수 있습니다.
          </p>
        )}
      </section>

      {info && info.pass_rates.length > 0 && (
        <section className="mb-10">
          <h2 className="text-base font-bold mb-3">합격률과 응시자 수</h2>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[520px] text-sm">
              <thead className="border-y bg-muted/40 text-xs text-muted-foreground">
                <tr>
                  <th className="px-2 py-2 text-left font-normal">연도</th>
                  <th className="px-2 py-2 text-right font-normal">필기 응시</th>
                  <th className="px-2 py-2 text-right font-normal">필기 합격</th>
                  <th className="px-2 py-2 text-right font-normal">필기 합격률</th>
                  <th className="px-2 py-2 text-right font-normal">실기 응시</th>
                  <th className="px-2 py-2 text-right font-normal">실기 합격</th>
                  <th className="px-2 py-2 text-right font-normal">실기 합격률</th>
                </tr>
              </thead>
              <tbody>
                {info.pass_rates.map((row) => (
                  <tr key={row.year} className="border-b tabular-nums">
                    <td className="px-2 py-2">{row.year}</td>
                    <td className="px-2 py-2 text-right">{row.written?.applicants.toLocaleString() ?? '-'}</td>
                    <td className="px-2 py-2 text-right">{row.written?.passed.toLocaleString() ?? '-'}</td>
                    <td className="px-2 py-2 text-right font-bold text-emerald-700">
                      {row.written ? `${row.written.rate}%` : '-'}
                    </td>
                    <td className="px-2 py-2 text-right">{row.practical?.applicants.toLocaleString() ?? '-'}</td>
                    <td className="px-2 py-2 text-right">{row.practical?.passed.toLocaleString() ?? '-'}</td>
                    <td className="px-2 py-2 text-right font-bold">
                      {row.practical ? `${row.practical.rate}%` : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            공단이 공개한 회차별 응시자·합격자 수를 연도별로 더한 값입니다. {info.fetched_on} 기준이며, 최근 연도는
            아직 집계되지 않은 회차가 있을 수 있습니다.
          </p>
        </section>
      )}

      {info && info.how_to.length > 0 && (
        <section className="mb-10">
          <h2 className="text-base font-bold mb-3">응시 방법 (공단 안내)</h2>
          <ul className="space-y-1 border p-4 text-sm leading-relaxed">
            {info.how_to.map((line, index) => (
              <li key={index} className={line.startsWith('-') ? 'pl-3' : 'font-medium'}>
                {line}
              </li>
            ))}
          </ul>
        </section>
      )}

      {info && (
        <section className="mb-10">
          <h2 className="text-base font-bold mb-3">준비물</h2>
          <ul className="list-disc space-y-1 pl-5 text-sm leading-relaxed">
            <li>신분증. 신분증이 없으면 응시할 수 없습니다.</li>
            <li>수험표. 접수한 뒤 Q-Net에서 출력하거나 화면으로 확인합니다.</li>
            <li>필기시험은 컴퓨터로 치릅니다(CBT). 시험장과 입실 시간은 수험표에 나옵니다.</li>
            <li>
              실기시험 준비물은 종목마다 다릅니다. Q-Net의 「수험자 지참 준비물」에서 종목별 목록을 확인하세요.
            </li>
          </ul>
        </section>
      )}

      <section className="mb-10">
        <h2 className="text-base font-bold mb-3">출제기준 단원</h2>
        {subjects.map((subject) => {
          const outline = cert.outline.filter((unit) => !subject || unit.subject === subject)
          if (outline.length === 0) return null

          return (
            <div key={subject || 'all'} className="mb-6">
              {subject && <h3 className="font-semibold mb-2">{subject}</h3>}
              <ul className="divide-y border">
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
