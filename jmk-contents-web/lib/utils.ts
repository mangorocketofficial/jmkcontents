import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export interface AppLegalInfo {
  cleanedText: string
  termsOfUseUrl?: string
  privacyPolicyUrl?: string
}

export interface StoreLinkMetadata {
  label: string
  icon: string
}

function sanitizeLegalUrl(url: string): string {
  return url.replace(/[),.;]+$/g, '')
}

export function extractAppLegalInfo(text?: string): AppLegalInfo {
  if (!text) {
    return { cleanedText: '' }
  }

  let termsOfUseUrl: string | undefined
  let privacyPolicyUrl: string | undefined

  const cleanedLines = text
    .split('\n')
    .map((rawLine) => {
      let nextLine = rawLine.trim()

      const termsMatch = nextLine.match(
        /(?:Terms of Use\s*\(EULA\)|이용약관(?:\s*\(EULA\))?)\s*:\s*(https?:\/\/\S+)/i
      )
      if (termsMatch) {
        termsOfUseUrl = termsOfUseUrl || sanitizeLegalUrl(termsMatch[1])
        nextLine = nextLine.replace(termsMatch[0], '').trim()
      }

      const privacyMatch = nextLine.match(
        /(?:Privacy Policy|개인정보\s*처리방침)\s*:\s*(https?:\/\/\S+)/i
      )
      if (privacyMatch) {
        privacyPolicyUrl = privacyPolicyUrl || sanitizeLegalUrl(privacyMatch[1])
        nextLine = nextLine.replace(privacyMatch[0], '').trim()
      }

      return nextLine
    })

  const cleanedText = cleanedLines
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim()

  return {
    cleanedText,
    termsOfUseUrl,
    privacyPolicyUrl,
  }
}

export function getStoreLinkMetadata(url?: string): StoreLinkMetadata {
  if (!url) {
    return {
      label: '앱 다운로드',
      icon: '📱',
    }
  }

  if (url.includes('play.google.com')) {
    return {
      label: 'Google Play에서 다운로드',
      icon: '▶',
    }
  }

  if (url.includes('apps.apple.com')) {
    return {
      label: 'App Store에서 다운로드',
      icon: '🍎',
    }
  }

  return {
    label: '앱 다운로드',
    icon: '📱',
  }
}
