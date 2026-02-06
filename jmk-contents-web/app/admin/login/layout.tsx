export default function LoginLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // 로그인 페이지는 별도의 레이아웃 사용 (인증 체크 없음)
  return <>{children}</>
}
