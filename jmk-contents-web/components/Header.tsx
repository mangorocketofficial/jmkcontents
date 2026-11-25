import Link from 'next/link'

export function Header() {
  return (
    <header className="border-b-2 border-emerald-700">
      <div className="mx-auto flex w-full max-w-[1120px] items-end justify-between px-4 py-3">
        <Link href="/" className="flex items-baseline gap-2">
          <span className="text-xl font-bold">JMK Contents</span>
          <span className="hidden text-xs text-muted-foreground sm:inline">자격증 필기 공부방</span>
        </Link>
        <nav className="flex gap-4 text-sm">
          <Link href="/exams" className="hover:underline">종목 목록</Link>
          <Link href="/concepts" className="hover:underline">핵심개념</Link>
          <Link href="/support" className="hover:underline">지원</Link>
        </nav>
      </div>
    </header>
  )
}
