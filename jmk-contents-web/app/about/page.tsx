import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">JMK Contents 소개</h1>
        <p className="text-xl text-muted-foreground">
          한국 자격증 시험 준비를 위한 최고의 파트너
        </p>
      </div>

      <div className="space-y-8">
        <section>
          <h2 className="text-2xl font-bold mb-4">우리의 미션</h2>
          <p className="text-lg text-muted-foreground">
            JMK Contents는 자격증 시험을 준비하는 모든 분들이 언제 어디서나
            효과적으로 학습할 수 있도록 돕는 것을 목표로 합니다.
            30개 이상의 전문 학습 앱을 통해 최상의 학습 경험을 제공합니다.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-6">제공 서비스</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>📱 모바일 앱</CardTitle>
                <CardDescription>
                  30개 이상의 iOS 자격증 시험 준비 앱
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  산업안전, 전기, 소방, 건축 등 다양한 분야의 자격증 시험을
                  준비할 수 있는 전문 앱을 제공합니다.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>📝 기출문제</CardTitle>
                <CardDescription>
                  실제 시험 기출문제와 상세한 해설
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  최신 기출문제와 함께 상세한 해설을 제공하여
                  효과적인 학습이 가능합니다.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>🎧 음성 듣기</CardTitle>
                <CardDescription>
                  이동 중에도 학습 가능한 음성 기능
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  출퇴근 시간, 운동 중에도 문제와 해설을 음성으로
                  들으며 학습할 수 있습니다.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>📊 학습 통계</CardTitle>
                <CardDescription>
                  체계적인 학습 관리와 진도 추적
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  학습 진도와 성취도를 한눈에 확인하고
                  취약한 부분을 집중 학습할 수 있습니다.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">지원 분야</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              '산업안전',
              '전기',
              '소방',
              '건축',
              '기계',
              '환경',
              '화공',
              '토목',
            ].map((field) => (
              <div
                key={field}
                className="bg-muted rounded-lg p-4 text-center font-medium"
              >
                {field}
              </div>
            ))}
          </div>
        </section>

        <section className="bg-muted rounded-lg p-8">
          <h2 className="text-2xl font-bold mb-4">연락하기</h2>
          <div className="space-y-2 text-muted-foreground">
            <p>📧 이메일: bombezzang100@gmail.com</p>
            <p>🌐 웹사이트: jmkcontents.com</p>
            <p>💼 사업자: JMK Contents</p>
          </div>
        </section>
      </div>
    </div>
  )
}
