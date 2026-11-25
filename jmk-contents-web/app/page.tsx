import Link from 'next/link'
import { getCertContent } from '@/lib/cert-content'
import { getSiteExams } from '@/lib/site-menu'

export const revalidate = 3600

const PREVIEW_ROWS = 6

export default async function Home() {
  const exams = await getSiteExams()
  const questionExams = exams.filter((exam) => exam.questionCount > 0)
  const conceptExams = exams.filter((exam) => exam.conceptCount > 0)
  const boards = await Promise.all(
    questionExams.map(async (exam) => ({ exam, cert: await getCertContent(exam.slug) }))
  )
  const totalQuestions = questionExams.reduce((sum, exam) => sum + exam.questionCount, 0)

  return (
    <div>
      <h1 className="border-b border-foreground pb-2 text-lg font-bold">전체 자료</h1>

      <ul className="border-b bg-muted/40 text-sm">
        <li className="flex gap-3 border-b px-3 py-2 last:border-b-0">
          <span className="shrink-0 font-bold text-emerald-700">공지</span>
          <span>
            {questionExams.length}개 종목 예상문제 {totalQuestions.toLocaleString()}문항을 단원별로 올렸습니다.
            모든 문항에 정답과 해설이 있습니다.
          </span>
        </li>
        <li className="flex gap-3 px-3 py-2">
          <span className="shrink-0 font-bold text-emerald-700">안내</span>
          <span>왼쪽 메뉴에서 종목을 고르면 예상문제, 핵심요약, 시험 정보를 볼 수 있습니다.</span>
        </li>
      </ul>

      <div className="mt-6 grid grid-cols-1 gap-x-6 gap-y-8 lg:grid-cols-2">
        {boards.map(({ exam, cert }) =>
          cert ? (
            <section key={exam.slug}>
              <div className="flex items-baseline justify-between border-b border-foreground pb-1.5">
                <h2 className="text-sm font-bold">
                  <Link href={`/exams/${exam.slug}`} className="hover:underline">
                    {exam.name} 예상문제
                  </Link>
                </h2>
                <Link href={`/exams/${exam.slug}`} className="text-xs text-muted-foreground hover:underline">
                  더보기 ›
                </Link>
              </div>
              <ul className="text-sm">
                {cert.units.slice(0, PREVIEW_ROWS).map((unit) => (
                  <li key={unit.id} className="flex items-baseline gap-2 border-b px-1 py-1.5">
                    <Link
                      href={`/exams/${exam.slug}/questions/${unit.id}`}
                      className="min-w-0 truncate hover:underline"
                    >
                      {unit.name}
                    </Link>
                    <span className="shrink-0 text-xs font-bold text-emerald-700">
                      [{unit.questions.length}]
                    </span>
                  </li>
                ))}
              </ul>
              <p className="mt-1.5 px-1 text-xs text-muted-foreground">
                <Link href={`/exams/${exam.slug}/summary`} className="hover:underline">핵심요약</Link>
                {' · '}
                <Link href={`/exams/${exam.slug}/info`} className="hover:underline">시험 정보</Link>
                {' · '}단원 {exam.unitCount}개, {exam.questionCount.toLocaleString()}문항
              </p>
            </section>
          ) : null
        )}
      </div>

      {conceptExams.length > 0 && (
        <section className="mt-10">
          <div className="flex items-baseline justify-between border-b border-foreground pb-1.5">
            <h2 className="text-sm font-bold">핵심개념 자료</h2>
            <Link href="/concepts" className="text-xs text-muted-foreground hover:underline">
              더보기 ›
            </Link>
          </div>
          <ul className="grid grid-cols-1 text-sm sm:grid-cols-2">
            {conceptExams.map((exam) => (
              <li key={exam.slug} className="flex items-baseline gap-2 border-b px-1 py-1.5">
                <Link href={`/exams/${exam.slug}/concepts`} className="min-w-0 truncate hover:underline">
                  {exam.name} 핵심개념
                </Link>
                <span className="shrink-0 text-xs font-bold text-emerald-700">[{exam.conceptCount}]</span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  )
}
