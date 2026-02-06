'use server'

import { cookies } from 'next/headers'

const ADMIN_SESSION_COOKIE = 'admin_session'
const SESSION_MAX_AGE = 60 * 60 * 24 * 7 // 7 days

export interface LoginResult {
  success: boolean
  message: string
}

/**
 * Admin 로그인
 * - 환경변수 ADMIN_PASSWORD와 비교
 * - 성공 시 쿠키에 세션 저장
 */
export async function adminLogin(password: string): Promise<LoginResult> {
  const adminPassword = process.env.ADMIN_PASSWORD

  if (!adminPassword) {
    console.error('ADMIN_PASSWORD environment variable is not set')
    return {
      success: false,
      message: '관리자 설정이 올바르지 않습니다.',
    }
  }

  if (password !== adminPassword) {
    return {
      success: false,
      message: '비밀번호가 올바르지 않습니다.',
    }
  }

  // 세션 쿠키 설정
  const cookieStore = await cookies()
  cookieStore.set(ADMIN_SESSION_COOKIE, 'authenticated', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: SESSION_MAX_AGE,
    path: '/',
  })

  return {
    success: true,
    message: '로그인 성공',
  }
}

/**
 * Admin 로그아웃
 */
export async function adminLogout(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete(ADMIN_SESSION_COOKIE)
}

/**
 * Admin 인증 확인
 * - 서버 컴포넌트에서 사용
 */
export async function isAdminAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies()
  const session = cookieStore.get(ADMIN_SESSION_COOKIE)
  return session?.value === 'authenticated'
}
