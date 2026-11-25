import { Button } from '@/components/ui/button'

interface CertAppBannerProps {
  name: string
  iosUrl: string
  text?: string
}

// 문제·요약 페이지에서 앱으로 보내는 안내.
export function CertAppBanner({ name, iosUrl, text }: CertAppBannerProps) {
  if (!iosUrl) {
    return null
  }

  return (
    <aside className="my-8 rounded-xl border bg-muted/30 p-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="font-semibold">{name} 앱에서 이어 풀기</p>
        <p className="text-sm text-muted-foreground">
          {text || '기출문제 회차별 풀이, 모의고사, 오답노트를 앱에서 쓸 수 있습니다.'}
        </p>
      </div>
      <a href={iosUrl} target="_blank" rel="noopener noreferrer" className="shrink-0">
        <Button>App Store에서 받기</Button>
      </a>
    </aside>
  )
}
