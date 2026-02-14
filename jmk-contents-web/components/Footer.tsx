import Link from 'next/link'

export function Footer() {
  return (
    <footer className="border-t mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="font-bold mb-4">JMK Contents</h3>
            <p className="text-sm text-muted-foreground">
              한국 자격증 시험 준비를 위한<br />
              학습 플랫폼
            </p>
          </div>
          <div>
            <h3 className="font-bold mb-4">법률</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/privacy" className="text-muted-foreground hover:text-primary transition-colors">
                  개인정보 처리방침
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-muted-foreground hover:text-primary transition-colors">
                  이용약관
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold mb-4">지원</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/support" className="text-muted-foreground hover:text-primary transition-colors">
                  고객 지원
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-muted-foreground hover:text-primary transition-colors">
                  문의하기
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} JMK Contents. All rights reserved.</p>
          <p className="mt-2">Email: bombezzang100@gmail.com</p>
        </div>
      </div>
    </footer>
  )
}
