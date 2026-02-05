import Link from 'next/link'

export function Header() {
  return (
    <header className="border-b">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="text-2xl font-bold">
          JMK Contents
        </Link>
        <nav className="flex gap-6">
          <Link href="/apps" className="hover:text-primary transition-colors">
            앱 목록
          </Link>
          <Link href="/support" className="hover:text-primary transition-colors">
            지원
          </Link>
          <Link href="/about" className="hover:text-primary transition-colors">
            소개
          </Link>
        </nav>
      </div>
    </header>
  )
}
