import Script from 'next/script'
import { GA_MEASUREMENT_ID } from '@/lib/analytics'

// GA4 태그. 페이지 이동(클라이언트 라우팅)은 향상된 측정의 "브라우저 기록 이벤트 기반 페이지 변경"으로 잡힌다.
export function GoogleAnalytics() {
  if (!GA_MEASUREMENT_ID) {
    return null
  }

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
        strategy="afterInteractive"
      />
      <Script id="ga4-init" strategy="afterInteractive">
        {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${GA_MEASUREMENT_ID}');`}
      </Script>
    </>
  )
}
