import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function SupportPage() {
  const faqs = [
    {
      question: '앱을 다운로드하려면 어떻게 해야 하나요?',
      answer: '각 앱 페이지에서 "App Store에서 다운로드" 버튼을 클릭하면 Apple App Store로 이동합니다.',
    },
    {
      question: '앱은 무료인가요?',
      answer: '대부분의 앱은 무료로 다운로드할 수 있으며, 광고가 포함되어 있습니다. 일부 앱은 프리미엄 기능을 제공할 수 있습니다.',
    },
    {
      question: '오프라인에서도 사용할 수 있나요?',
      answer: '예, 대부분의 앱은 다운로드 후 오프라인에서도 기출문제를 풀 수 있습니다. 음성 듣기 기능도 오프라인에서 사용 가능합니다.',
    },
    {
      question: '어떤 자격증 시험을 지원하나요?',
      answer: '산업안전, 전기, 소방, 건축 등 30개 이상의 한국 자격증 시험을 지원합니다. 앱 목록 페이지에서 전체 목록을 확인하세요.',
    },
    {
      question: '기출문제는 얼마나 자주 업데이트되나요?',
      answer: '새로운 기출문제가 공개되면 정기적으로 업데이트됩니다. 앱 내에서 업데이트 알림을 받을 수 있습니다.',
    },
    {
      question: '환불은 어떻게 받나요?',
      answer: 'Apple App Store의 환불 정책에 따라 처리됩니다. App Store 설정에서 구매 내역을 확인하고 환불을 요청하세요.',
    },
  ]

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">고객 지원</h1>
        <p className="text-xl text-muted-foreground">
          자주 묻는 질문과 답변을 확인하세요
        </p>
      </div>

      {/* FAQ Section */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-6">자주 묻는 질문 (FAQ)</h2>
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <Card key={index}>
              <CardHeader>
                <CardTitle className="text-lg">{faq.question}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  {faq.answer}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Contact Section */}
      <section className="mb-12">
        <Card>
          <CardHeader>
            <CardTitle>문제가 해결되지 않으셨나요?</CardTitle>
            <CardDescription>
              추가 지원이 필요하시면 문의해 주세요
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="font-medium mb-2">이메일 지원</p>
              <p className="text-muted-foreground mb-4">
                bombezzang100@gmail.com
              </p>
              <p className="text-sm text-muted-foreground">
                운영 시간: 평일 오전 9시 - 오후 6시 (KST)
              </p>
            </div>
            <Link href="/contact">
              <Button className="w-full">문의하기</Button>
            </Link>
          </CardContent>
        </Card>
      </section>

      {/* Additional Resources */}
      <section>
        <h2 className="text-2xl font-bold mb-6">추가 자료</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link href="/privacy">
            <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
              <CardHeader>
                <CardTitle className="text-lg">개인정보 처리방침</CardTitle>
                <CardDescription>
                  개인정보 보호 정책을 확인하세요
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>
          <Link href="/terms">
            <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
              <CardHeader>
                <CardTitle className="text-lg">이용약관</CardTitle>
                <CardDescription>
                  서비스 이용약관을 확인하세요
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>
        </div>
      </section>
    </div>
  )
}
