import Link from 'next/link'

export function Header() {
  return (
    <header className="border-b">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="text-2xl font-bold">
          JMK Contents
        </Link>
        <nav className="flex gap-6">
          <Link href="/exams" className="hover:text-primary transition-colors">
            자격증 과목
          </Link>
          <Link href="/concepts" className="hover:text-primary transition-colors">
            핵심개념
          </Link>
          <Link href="/lectures" className="hover:text-primary transition-colors">
            영상강의
          </Link>
          <Link href="/support" className="hover:text-primary transition-colors">
            지원
          </Link>
        </nav>
      </div>
    </header>
  )
}
