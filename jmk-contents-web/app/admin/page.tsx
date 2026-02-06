import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { getApps } from '@/lib/firebase/apps'
import { getFirestoreDb } from '@/lib/firebase/admin'
import { COLLECTIONS } from '@/lib/firebase/types'
import { AppWindow, BookOpen, Mic, Mail, ArrowRight } from 'lucide-react'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function AdminDashboard() {
  // 통계 데이터 가져오기
  const db = getFirestoreDb()
  const [apps, conceptsSnapshot, lecturesSnapshot, contactsSnapshot] = await Promise.all([
    getApps(),
    db.collection(COLLECTIONS.CONCEPTS).get(),
    db.collection(COLLECTIONS.LECTURES).get(),
    db.collection(COLLECTIONS.CONTACT_SUBMISSIONS).get(),
  ])

  const stats = [
    {
      title: 'Apps',
      value: apps.length,
      icon: AppWindow,
      href: '/admin/apps',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Concepts',
      value: conceptsSnapshot.size,
      icon: BookOpen,
      href: '/admin/concepts',
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Lectures',
      value: lecturesSnapshot.size,
      icon: Mic,
      href: '/admin/lectures',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      title: 'Contact Submissions',
      value: contactsSnapshot.size,
      icon: Mail,
      href: '/admin/contacts',
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
  ]

  // 최근 contact submissions (pending만)
  const pendingContacts = contactsSnapshot.docs
    .map((doc) => ({
      id: doc.id,
      ...doc.data(),
      created_at: doc.data().created_at || new Date().toISOString(),
    }))
    .filter((contact: any) => contact.status === 'pending')
    .sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5)

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
        <p className="text-muted-foreground">
          JMK Contents 관리자 대시보드에 오신 것을 환영합니다
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <div className={`${stat.bgColor} p-2 rounded-lg`}>
                  <Icon className={`w-5 h-5 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold mb-1">{stat.value}</div>
                <Link href={stat.href}>
                  <Button variant="link" className="px-0 h-auto text-sm">
                    관리하기 <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Recent Pending Contacts */}
      {pendingContacts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>최근 문의사항</CardTitle>
            <CardDescription>
              처리 대기 중인 문의사항 {pendingContacts.length}건
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {pendingContacts.map((contact: any) => (
                <div
                  key={contact.id}
                  className="flex items-start justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium">{contact.name}</span>
                      <span className="text-sm text-muted-foreground">
                        ({contact.email})
                      </span>
                    </div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">
                      {contact.subject}
                    </p>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {contact.message}
                    </p>
                  </div>
                  <div className="text-xs text-muted-foreground ml-4">
                    {new Date(contact.created_at).toLocaleDateString('ko-KR')}
                  </div>
                </div>
              ))}
            </div>
            <Link href="/admin/contacts">
              <Button variant="outline" className="w-full mt-4">
                모든 문의사항 보기
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>빠른 작업</CardTitle>
          <CardDescription>자주 사용하는 작업</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link href="/admin/apps?action=new">
              <Button variant="outline" className="w-full justify-start gap-2">
                <AppWindow className="w-4 h-4" />
                새 앱 추가
              </Button>
            </Link>
            <Link href="/admin/concepts?action=new">
              <Button variant="outline" className="w-full justify-start gap-2">
                <BookOpen className="w-4 h-4" />
                새 개념 추가
              </Button>
            </Link>
            <Link href="/admin/lectures?action=new">
              <Button variant="outline" className="w-full justify-start gap-2">
                <Mic className="w-4 h-4" />
                새 강의 추가
              </Button>
            </Link>
            <Link href="/">
              <Button variant="outline" className="w-full justify-start gap-2">
                <ArrowRight className="w-4 h-4" />
                사이트 보기
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
