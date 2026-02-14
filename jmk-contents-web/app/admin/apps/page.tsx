import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { getApps } from '@/lib/firebase/apps'
import { AppWindow, Plus, Edit, ExternalLink } from 'lucide-react'
import { DeleteAppButton } from '@/components/admin/DeleteAppButton'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function AdminAppsPage() {
  const apps = await getApps()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Apps 관리</h1>
          <p className="text-muted-foreground">등록된 앱: {apps.length}개</p>
        </div>
        <Link href="/admin/apps/new">
          <Button className="gap-2">
            <Plus className="w-4 h-4" />
            새 앱 추가
          </Button>
        </Link>
      </div>

      {/* Apps Grid */}
      {apps.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {apps.map((app) => (
            <Card key={app.bundle_id} className="flex flex-col">
              <CardHeader>
                <div className="flex items-start gap-4">
                  {app.icon_url ? (
                    <img
                      src={app.icon_url}
                      alt={app.app_name}
                      className="w-16 h-16 rounded-xl"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-xl bg-muted flex items-center justify-center">
                      <AppWindow className="w-8 h-8 text-muted-foreground" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-lg mb-1 truncate">
                      {app.app_name}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground truncate">
                      {app.bundle_id}
                    </p>
                    <div className="flex gap-2 mt-2">
                      <span
                        className={`inline-block px-2 py-1 rounded text-xs ${
                          app.status === 'published'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {app.status === 'published' ? '공개' : '비공개'}
                      </span>
                      {app.is_featured && (
                        <span className="inline-block px-2 py-1 rounded text-xs bg-blue-100 text-blue-800">
                          추천
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col">
                <p className="text-sm text-muted-foreground mb-4 line-clamp-2 flex-1">
                  {app.description || '설명 없음'}
                </p>

                {/* Stats */}
                <div className="flex gap-4 text-sm text-muted-foreground mb-4 pb-4 border-b">
                  <div>
                    ⭐ {app.rating?.toFixed(1) || '0.0'}
                  </div>
                  <div>
                    ⬇️ {app.download_count?.toLocaleString() || '0'}+
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <Link href={`/exams/${app.bundle_id}`} className="flex-1">
                    <Button variant="outline" size="sm" className="w-full gap-2">
                      <ExternalLink className="w-4 h-4" />
                      보기
                    </Button>
                  </Link>
                  <Link href={`/admin/apps/${app.bundle_id}/edit`} className="flex-1">
                    <Button variant="outline" size="sm" className="w-full gap-2">
                      <Edit className="w-4 h-4" />
                      수정
                    </Button>
                  </Link>
                  <DeleteAppButton bundleId={app.bundle_id} appName={app.app_name} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <AppWindow className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-lg text-muted-foreground mb-4">등록된 앱이 없습니다</p>
            <Link href="/admin/apps/new">
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                첫 번째 앱 추가하기
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
