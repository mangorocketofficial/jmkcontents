'use client'

import type { ReactNode } from 'react'
import { usePathname } from 'next/navigation'

interface SiteShellProps {
  sidebar: ReactNode
  children: ReactNode
}

// 공개 페이지는 왼쪽 메뉴 + 본문 두 단으로, 관리자 화면은 본문만 그린다.
export function SiteShell({ sidebar, children }: SiteShellProps) {
  const pathname = usePathname() || ''

  if (pathname.startsWith('/admin')) {
    return <main className="flex-1">{children}</main>
  }

  return (
    <div className="mx-auto w-full max-w-[1120px] flex-1 px-4 py-5 md:flex md:gap-6">
      <aside className="md:w-[200px] md:shrink-0">{sidebar}</aside>
      <main className="min-w-0 flex-1">{children}</main>
    </div>
  )
}
