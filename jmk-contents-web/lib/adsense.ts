const DEFAULT_ADSENSE_CLIENT = 'ca-pub-2598779635969436'

export const ADSENSE_CLIENT = (
  process.env.NEXT_PUBLIC_GOOGLE_ADSENSE_CLIENT?.trim()
  || DEFAULT_ADSENSE_CLIENT
)

export const ADSENSE_PUBLISHER_ID = ADSENSE_CLIENT.startsWith('ca-')
  ? ADSENSE_CLIENT.replace(/^ca-/, '')
  : ''

export const ADSENSE_SCRIPT_SRC = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT}`
