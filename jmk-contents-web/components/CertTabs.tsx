import Link from 'next/link'
import { getSiteExams } from '@/lib/site-menu'

type CertTab = 'questions' | 'summary' | 'info' | 'concepts'

interface CertTabsProps {
  slug: string
  active: CertTab
}

// 종목 게시판 위쪽의 말머리 탭.
export async function CertTabs({ slug, active }: CertTabsProps) {
  const exam = (await getSiteExams()).find((entry) => entry.slug === slug)
  const base = `/exams/${slug}`
  const tabs: { id: CertTab; label: string; href: string }[] = [
    { id: 'questions', label: '예상문제', href: base },
    { id: 'summary', label: '핵심요약', href: `${base}/summary` },
    { id: 'info', label: '시험 정보', href: `${base}/info` },
  ]

  if (exam && exam.conceptCount > 0) {
    tabs.push({ id: 'concepts', label: '핵심개념', href: `${base}/concepts` })
  }

  return (
    <ul className="mb-4 flex border-b border-foreground text-sm">
      {tabs.map((tab) => (
        <li key={tab.id}>
          <Link
            href={tab.href}
            className={`block px-4 py-2 ${
              tab.id === active
                ? 'bg-foreground font-bold text-background'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab.label}
          </Link>
        </li>
      ))}
    </ul>
  )
}
