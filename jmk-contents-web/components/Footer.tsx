import Link from 'next/link'

export function Footer() {
  return (
    <footer className="mt-auto border-t bg-muted/30">
      <div className="mx-auto w-full max-w-[1120px] px-4 py-5 text-xs text-muted-foreground">
        <nav className="flex flex-wrap gap-x-4 gap-y-1">
          <Link href="/about" className="hover:underline">사이트 소개</Link>
          <Link href="/privacy" className="font-bold hover:underline">개인정보 처리방침</Link>
          <Link href="/terms" className="hover:underline">이용약관</Link>
          <Link href="/support" className="hover:underline">고객 지원</Link>
          <Link href="/contact" className="hover:underline">문의하기</Link>
        </nav>
        <p className="mt-2">
          &copy; {new Date().getFullYear()} JMK Contents · Email: bombezzang100@gmail.com
        </p>
      </div>
    </footer>
  )
}
