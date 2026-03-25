import { ADSENSE_CLIENT, ADSENSE_SCRIPT_SRC } from '@/lib/adsense'

export function AdSenseHead() {
  if (!ADSENSE_CLIENT) {
    return null
  }

  return (
    <>
      <meta
        name="google-adsense-account"
        content={ADSENSE_CLIENT}
      />
      <script
        async
        src={ADSENSE_SCRIPT_SRC}
        crossOrigin="anonymous"
      />
    </>
  )
}
