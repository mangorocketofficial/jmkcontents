import { ADSENSE_PUBLISHER_ID } from '@/lib/adsense'

export const revalidate = 3600

export function GET() {
  const body = ADSENSE_PUBLISHER_ID
    ? `google.com, ${ADSENSE_PUBLISHER_ID}, DIRECT, f08c47fec0942fa0\n`
    : '# AdSense publisher ID is not configured.\n'

  return new Response(body, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
    },
  })
}
