export default function TermsPage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <h1 className="text-4xl font-bold mb-8">이용약관</h1>

      <div className="prose prose-lg max-w-none space-y-8">
        <section>
          <h2 className="text-2xl font-bold mb-4">1. 약관의 적용</h2>
          <p className="text-muted-foreground">
            본 이용약관은 JMK Contents(이하 "회사")가 제공하는 모든 서비스
            (이하 "서비스")의 이용과 관련하여 회사와 이용자 간의 권리, 의무 및
            책임사항을 규정함을 목적으로 합니다.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">2. 서비스의 제공</h2>
          <p className="text-muted-foreground">
            회사는 다음과 같은 서비스를 제공합니다:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
            <li>자격증 시험 준비 모바일 애플리케이션</li>
            <li>기출문제 및 학습 자료</li>
            <li>음성 듣기 기능</li>
            <li>학습 통계 및 진도 관리</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">3. 서비스 이용</h2>
          <p className="text-muted-foreground">
            이용자는 본 약관에 동의함으로써 서비스를 이용할 수 있습니다.
            서비스 이용 시 다음 사항을 준수해야 합니다:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
            <li>타인의 정보를 도용하지 않을 것</li>
            <li>서비스를 상업적 목적으로 무단 사용하지 않을 것</li>
            <li>서비스의 정상적인 운영을 방해하지 않을 것</li>
            <li>관련 법령을 준수할 것</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">4. 저작권</h2>
          <p className="text-muted-foreground">
            서비스에 포함된 모든 콘텐츠(문제, 해설, 음성 등)의 저작권은 회사 또는
            원저작자에게 있습니다. 이용자는 서비스를 통해 제공받은 콘텐츠를
            회사의 사전 승낙 없이 복제, 전송, 배포, 방송 기타 방법에 의하여
            영리목적으로 이용하거나 제3자에게 이용하게 하여서는 안 됩니다.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">5. 유료 서비스</h2>
          <p className="text-muted-foreground">
            일부 서비스는 유료로 제공될 수 있습니다. 유료 서비스 이용 시:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
            <li>Apple App Store의 결제 정책이 적용됩니다</li>
            <li>환불은 App Store 정책에 따라 처리됩니다</li>
            <li>구독은 자동 갱신될 수 있습니다</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">6. 서비스 중단</h2>
          <p className="text-muted-foreground">
            회사는 다음의 경우 서비스 제공을 일시적으로 중단할 수 있습니다:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
            <li>시스템 정기 점검, 보수, 교체 시</li>
            <li>통신 장애 등 불가피한 사유 발생 시</li>
            <li>기타 서비스 운영상 필요한 경우</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">7. 면책 조항</h2>
          <p className="text-muted-foreground">
            회사는 다음의 경우 책임을 지지 않습니다:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
            <li>천재지변 또는 이에 준하는 불가항력으로 인한 서비스 중단</li>
            <li>이용자의 귀책사유로 인한 서비스 이용 장애</li>
            <li>제3자의 고의 또는 과실로 인한 서비스 장애</li>
            <li>서비스를 통해 기대하는 시험 결과에 대한 보장</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">8. 약관의 변경</h2>
          <p className="text-muted-foreground">
            회사는 필요한 경우 본 약관을 변경할 수 있으며, 약관이 변경되는 경우
            웹사이트 또는 앱을 통해 공지합니다. 변경된 약관은 공지일로부터
            7일 후부터 효력이 발생합니다.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">9. 분쟁 해결</h2>
          <p className="text-muted-foreground">
            본 약관과 관련하여 분쟁이 발생한 경우, 회사와 이용자는 성실히
            협의하여 해결하도록 노력합니다. 협의가 이루어지지 않을 경우,
            대한민국 법률에 따라 관할 법원에서 해결합니다.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">10. 문의하기</h2>
          <div className="bg-muted p-4 rounded-lg">
            <p className="font-medium">JMK Contents</p>
            <p className="text-muted-foreground">이메일: bombezzang100@gmail.com</p>
          </div>
        </section>

        <div className="text-sm text-muted-foreground border-t pt-6 mt-8">
          <p>시행일: 2026년 2월 5일</p>
        </div>
      </div>
    </div>
  )
}
