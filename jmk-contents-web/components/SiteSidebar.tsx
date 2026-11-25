'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export interface SidebarExam {
  slug: string
  name: string
  hasCert: boolean
  hasConcepts: boolean
}

export interface SidebarGroup {
  category: string
  exams: SidebarExam[]
}

interface SiteSidebarProps {
  groups: SidebarGroup[]
  examCount: number
  questionCount: number
  conceptCount: number
}

function Menu({ groups, examCount, questionCount, conceptCount }: SiteSidebarProps) {
  const pathname = usePathname() || ''
  const linkClass = (active: boolean) =>
    `block px-3 py-1 hover:underline ${active ? 'font-bold text-emerald-700' : ''}`

  return (
    <div className="text-[13px]">
      <div className="border border-b-0 bg-emerald-700 px-3 py-3 text-white">
        <p className="text-sm font-bold">자격증 필기 공부방</p>
        <p className="mt-1 text-xs opacity-90">
          종목 {examCount}개 · 예상문제 {questionCount.toLocaleString()}문항
          <br />
          핵심개념 {conceptCount.toLocaleString()}개
        </p>
      </div>
      <nav className="border">
        <ul className="border-b py-2">
          <li>
            <Link href="/" className={linkClass(pathname === '/')}>전체 자료 보기</Link>
          </li>
          <li>
            <Link href="/exams" className={linkClass(pathname === '/exams')}>종목 목록</Link>
          </li>
          <li>
            <Link href="/concepts" className={linkClass(pathname === '/concepts')}>핵심개념 모아 보기</Link>
          </li>
        </ul>
        {groups.map((group) => (
          <div key={group.category} className="border-b py-2 last:border-b-0">
            <p className="px-3 pb-1 text-xs font-bold text-muted-foreground">{group.category}</p>
            <ul>
              {group.exams.map((exam) => {
                const base = `/exams/${exam.slug}`
                const active = pathname === base || pathname.startsWith(`${base}/`)

                return (
                  <li key={exam.slug}>
                    <Link href={base} className={linkClass(active)}>
                      {exam.name}
                    </Link>
                    {active && (
                      <ul className="mb-1 ml-3 border-l pl-1 text-xs text-muted-foreground">
                        {exam.hasCert && (
                          <>
                            <li>
                              <Link href={base} className="block px-2 py-0.5 hover:underline">예상문제</Link>
                            </li>
                            <li>
                              <Link href={`${base}/summary`} className="block px-2 py-0.5 hover:underline">핵심요약</Link>
                            </li>
                            <li>
                              <Link href={`${base}/info`} className="block px-2 py-0.5 hover:underline">시험 정보</Link>
                            </li>
                          </>
                        )}
                        {exam.hasConcepts && (
                          <li>
                            <Link href={`${base}/concepts`} className="block px-2 py-0.5 hover:underline">핵심개념</Link>
                          </li>
                        )}
                      </ul>
                    )}
                  </li>
                )
              })}
            </ul>
          </div>
        ))}
        <ul className="border-t py-2">
          <li>
            <Link href="/support" className={linkClass(pathname === '/support')}>고객 지원</Link>
          </li>
          <li>
            <Link href="/contact" className={linkClass(pathname === '/contact')}>문의하기</Link>
          </li>
        </ul>
      </nav>
    </div>
  )
}

// 왼쪽 종목 메뉴. 좁은 화면에서는 접힌 채로 본문 위에 놓인다.
export function SiteSidebar(props: SiteSidebarProps) {
  return (
    <>
      <details className="mb-4 md:hidden">
        <summary className="cursor-pointer border bg-muted/40 px-3 py-2 text-sm font-medium">
          종목 메뉴 열기
        </summary>
        <div className="mt-2">
          <Menu {...props} />
        </div>
      </details>
      <div className="hidden md:block">
        <Menu {...props} />
      </div>
    </>
  )
}
