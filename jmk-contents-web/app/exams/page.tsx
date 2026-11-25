import type { Metadata } from 'next'
import Link from 'next/link'
import { getSiteExams } from '@/lib/site-menu'

export const metadata: Metadata = {
  title: '종목 목록 - JMK Contents',
  description: '자격증 종목별 필기 예상문제, 핵심요약, 핵심개념 자료 목록입니다.',
}

export const revalidate = 3600

export default async function ExamsPage() {
  const exams = await getSiteExams()

  return (
    <div>
      <h1 className="border-b border-foreground pb-2 text-lg font-bold">
        종목 목록 <span className="text-sm font-normal text-muted-foreground">{exams.length}개</span>
      </h1>

      {exams.length > 0 ? (
        <table className="w-full text-sm">
          <thead className="border-b bg-muted/40 text-xs text-muted-foreground">
            <tr>
              <th className="w-24 px-2 py-2 text-left font-normal">분류</th>
              <th className="px-2 py-2 text-left font-normal">종목</th>
              <th className="w-24 px-2 py-2 text-right font-normal">예상문제</th>
              <th className="hidden w-24 px-2 py-2 text-right font-normal sm:table-cell">핵심개념</th>
            </tr>
          </thead>
          <tbody>
            {exams.map((exam) => (
              <tr key={exam.slug} className="border-b hover:bg-muted/30">
                <td className="px-2 py-2 text-xs text-muted-foreground">{exam.category}</td>
                <td className="px-2 py-2">
                  <Link href={`/exams/${exam.slug}`} className="hover:underline">
                    {exam.name}
                  </Link>
                </td>
                <td className="px-2 py-2 text-right tabular-nums">
                  {exam.questionCount > 0 ? `${exam.questionCount.toLocaleString()}문항` : '-'}
                </td>
                <td className="hidden px-2 py-2 text-right tabular-nums sm:table-cell">
                  {exam.conceptCount > 0 ? `${exam.conceptCount.toLocaleString()}개` : '-'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p className="py-12 text-center text-muted-foreground">등록된 종목이 아직 없습니다.</p>
      )}
    </div>
  )
}
