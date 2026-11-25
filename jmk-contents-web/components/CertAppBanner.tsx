interface CertAppBannerProps {
  name: string
  iosUrl: string
  text?: string
}

// 게시판의 공지 줄처럼 보이는 앱 안내.
export function CertAppBanner({ name, iosUrl, text }: CertAppBannerProps) {
  if (!iosUrl) {
    return null
  }

  return (
    <aside className="my-6 flex flex-wrap items-center gap-x-3 gap-y-1 border bg-muted/40 px-4 py-3 text-sm">
      <span className="border border-emerald-700 px-1.5 py-0.5 text-xs font-bold text-emerald-700">앱</span>
      <span className="font-medium">{name} 앱에서 이어 풀기</span>
      <span className="text-muted-foreground">
        {text || '기출 회차별 풀이, 모의고사, 오답노트'}
      </span>
      <a
        href={iosUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="ml-auto font-medium text-emerald-700 underline underline-offset-4"
      >
        App Store에서 받기
      </a>
    </aside>
  )
}
