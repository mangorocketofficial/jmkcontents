import { redirect } from 'next/navigation'
import { isAdminAuthenticated } from '@/app/actions/auth'
import AdminNav from '@/components/admin/AdminNav'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const authenticated = await isAdminAuthenticated()

  // 로그인 페이지는 인증 없이 접근 가능
  // 다른 페이지는 인증 필요
  if (!authenticated) {
    // 현재 경로가 /admin/login이 아닌 경우에만 리다이렉트
    redirect('/admin/login')
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <AdminNav />
      <main className="container mx-auto px-4 py-8">{children}</main>
    </div>
  )
}
