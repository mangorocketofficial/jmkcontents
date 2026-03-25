export default function PrivacyPage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <h1 className="text-4xl font-bold mb-8">개인정보 처리방침</h1>

      <div className="prose prose-lg max-w-none space-y-8">
        <section>
          <h2 className="text-2xl font-bold mb-4">1. 적용 범위</h2>
          <p className="text-muted-foreground">
            본 개인정보 처리방침은 JMK Contents 웹사이트에서 제공하는 콘텐츠 열람,
            문의 접수, 광고 노출 과정에 적용됩니다.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">2. 수집하는 정보</h2>
          <p className="text-muted-foreground">
            당사는 다음 정보를 수집하거나 자동으로 처리할 수 있습니다:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
            <li>브라우저 정보, 기기 종류, 운영체제, IP 주소, 리퍼러, 접속 시간 등의 로그 정보</li>
            <li>쿠키 또는 유사 기술을 통해 저장되는 광고 및 사이트 이용 관련 정보</li>
            <li>문의하기를 통해 사용자가 직접 제출한 이름, 이메일, 문의 내용</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">3. 정보 사용 목적</h2>
          <p className="text-muted-foreground">
            수집된 정보는 다음 목적으로 사용됩니다:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
            <li>콘텐츠 제공 및 웹사이트 운영</li>
            <li>문의 응대 및 고객 지원</li>
            <li>광고 노출, 광고 성과 측정, 부정 트래픽 방지</li>
            <li>서비스 품질 개선 및 보안 점검</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">4. Google AdSense 및 제3자 광고</h2>
          <p className="text-muted-foreground">
            본 사이트는 Google AdSense를 포함한 광고 서비스를 사용할 수 있습니다.
            Google 및 제3자 광고 파트너는 쿠키, 웹 비콘 또는 유사 기술을 사용하여
            사용자의 이전 방문 기록에 기반한 광고를 제공할 수 있습니다.
          </p>
          <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
            <li>Google은 광고 쿠키를 사용하여 본 사이트 및 다른 사이트 방문 이력을 바탕으로 광고를 제공할 수 있습니다.</li>
            <li>사용자는 Google 광고 설정에서 개인 맞춤 광고를 관리하거나 해제할 수 있습니다.</li>
            <li>광고 클릭 후 이동하는 외부 사이트는 각 사이트의 개인정보 처리방침이 적용됩니다.</li>
          </ul>
          <div className="bg-muted p-4 rounded-lg mt-4 space-y-2 text-muted-foreground">
            <p>
              Google 광고 설정:
              {' '}
              <a
                href="https://adssettings.google.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="underline underline-offset-4"
              >
                https://adssettings.google.com/
              </a>
            </p>
            <p>
              Google의 데이터 사용 방식:
              {' '}
              <a
                href="https://policies.google.com/technologies/ads"
                target="_blank"
                rel="noopener noreferrer"
                className="underline underline-offset-4"
              >
                https://policies.google.com/technologies/ads
              </a>
            </p>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">5. 쿠키 및 동의</h2>
          <p className="text-muted-foreground">
            사용자는 브라우저 설정에서 쿠키를 차단하거나 삭제할 수 있습니다. 다만,
            일부 기능이나 광고 개인화 설정이 정상적으로 동작하지 않을 수 있습니다.
            유럽경제지역(EEA), 영국, 스위스 사용자에게는 관련 법령 및 Google 정책에
            따라 동의 메시지가 표시될 수 있습니다.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">6. 데이터 보안 및 보관</h2>
          <p className="text-muted-foreground">
            당사는 합리적인 수준의 기술적, 관리적 보호 조치를 적용하고 있습니다.
            다만 인터넷을 통한 전송이나 전자 저장 방식은 100% 안전을 보장할 수 없으며,
            문의 접수 등 사용자가 직접 제공한 정보는 목적 달성 후 필요한 범위 내에서만
            보관합니다.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">7. 아동의 개인정보</h2>
          <p className="text-muted-foreground">
            본 사이트는 만 13세 미만 아동을 대상으로 하지 않으며, 만 13세 미만 아동의
            개인 식별 정보를 고의로 수집하지 않습니다.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">8. 개인정보 처리방침 변경</h2>
          <p className="text-muted-foreground">
            본 방침은 법령, 서비스 변경, 광고 정책 변경에 따라 수정될 수 있으며,
            중요한 변경이 있는 경우 이 페이지를 통해 안내합니다.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">9. 문의하기</h2>
          <p className="text-muted-foreground">
            개인정보 처리방침 또는 광고 운영 관련 문의는 아래로 연락해 주세요:
          </p>
          <div className="bg-muted p-4 rounded-lg mt-4">
            <p className="font-medium">JMK Contents</p>
            <p className="text-muted-foreground">이메일: bombezzang100@gmail.com</p>
          </div>
        </section>

        <div className="text-sm text-muted-foreground border-t pt-6 mt-8">
          <p>최종 업데이트: 2026년 3월 25일</p>
        </div>
      </div>
    </div>
  )
}
