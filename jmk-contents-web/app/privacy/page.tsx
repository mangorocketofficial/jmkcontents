export default function PrivacyPage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <h1 className="text-4xl font-bold mb-8">개인정보 처리방침</h1>

      <div className="prose prose-lg max-w-none space-y-8">
        <section>
          <h2 className="text-2xl font-bold mb-4">1. 수집하는 정보</h2>
          <p className="text-muted-foreground">
            JMK Contents는 다음과 같은 정보를 수집합니다:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
            <li>기기 정보 (광고 ID)</li>
            <li>앱 사용 통계</li>
            <li>개인 식별 정보는 수집하지 않습니다</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">2. 정보 사용 목적</h2>
          <p className="text-muted-foreground">
            수집된 정보는 다음 목적으로 사용됩니다:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
            <li>맞춤형 광고 제공 (Google AdMob)</li>
            <li>서비스 개선</li>
            <li>사용 통계 분석 (Firebase Analytics)</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">3. 제3자 서비스</h2>
          <p className="text-muted-foreground">
            당사는 다음 제3자 서비스를 사용합니다:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
            <li>Google AdMob (광고)</li>
            <li>Firebase Analytics (분석)</li>
            <li>제휴 광고 플랫폼</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">4. 데이터 보안</h2>
          <p className="text-muted-foreground">
            귀하의 데이터 보안은 당사에게 중요하지만, 인터넷을 통한 전송 방법이나
            전자 저장 방법은 100% 안전하지 않습니다. 당사는 상업적으로 허용 가능한
            수단을 사용하여 귀하의 개인정보를 보호하기 위해 노력하지만,
            절대적인 보안을 보장할 수는 없습니다.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">5. 아동의 개인정보</h2>
          <p className="text-muted-foreground">
            당사의 서비스는 만 13세 미만의 아동을 대상으로 하지 않습니다.
            만 13세 미만 아동의 개인 식별 정보를 고의로 수집하지 않습니다.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">6. 개인정보 처리방침 변경</h2>
          <p className="text-muted-foreground">
            당사는 때때로 개인정보 처리방침을 업데이트할 수 있습니다.
            이 페이지에 새로운 개인정보 처리방침을 게시하여 변경 사항을 알려드립니다.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">7. 문의하기</h2>
          <p className="text-muted-foreground">
            개인정보 처리방침에 대한 질문이나 제안이 있으시면 다음으로 연락해 주세요:
          </p>
          <div className="bg-muted p-4 rounded-lg mt-4">
            <p className="font-medium">JMK Contents</p>
            <p className="text-muted-foreground">이메일: bombezzang100@gmail.com</p>
          </div>
        </section>

        <div className="text-sm text-muted-foreground border-t pt-6 mt-8">
          <p>최종 업데이트: 2026년 2월 5일</p>
        </div>
      </div>
    </div>
  )
}
