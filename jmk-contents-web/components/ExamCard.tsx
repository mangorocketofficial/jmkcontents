import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { App } from '@/lib/firebase/types'

interface ExamCardProps {
  app: App
  conceptCount: number
  lectureCount: number
}

export function ExamCard({ app, conceptCount, lectureCount }: ExamCardProps) {
  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <div className="flex items-start gap-4">
          {app.icon_url ? (
            <img
              src={app.icon_url}
              alt={app.app_name}
              className="w-16 h-16 rounded-lg object-cover"
            />
          ) : (
            <div className="w-16 h-16 rounded-lg bg-muted flex items-center justify-center">
              <span className="text-2xl font-bold text-muted-foreground">
                {app.app_name[0]}
              </span>
            </div>
          )}
          <div className="flex-1">
            <CardTitle className="text-lg">{app.app_name}</CardTitle>
            <div className="flex flex-wrap gap-1.5 mt-2">
              {app.app_category && (
                <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-800 rounded font-medium">
                  {app.app_category}
                </span>
              )}
              {app.categories && app.categories.slice(0, 2).map((category) => (
                <span
                  key={category}
                  className="text-xs px-2 py-0.5 bg-secondary text-secondary-foreground rounded"
                >
                  {category}
                </span>
              ))}
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col">
        <CardDescription className="flex-1 line-clamp-2">
          {app.description || '자격증 시험 학습 자료'}
        </CardDescription>
        <div className="flex items-center gap-4 mt-4 text-sm text-muted-foreground">
          <span>핵심개념 {conceptCount}개</span>
          {lectureCount > 0 && <span>영상강의 {lectureCount}개</span>}
        </div>
        <Link href={`/exams/${app.bundle_id}`} className="mt-4">
          <Button className="w-full">학습하기</Button>
        </Link>
      </CardContent>
    </Card>
  )
}
