import type { Metadata } from 'next'

import { SITE_URL } from '@/lib/site'

export const metadata: Metadata = {
  title: 'The Sori / Inner Voice Privacy Policy | JMK Contents',
  description:
    'Privacy policy for The Sori / Inner Voice, a voice-first journaling app with on-device speech recognition and locally stored journal data.',
  alternates: {
    canonical: `${SITE_URL}/privacy/the-sori`,
  },
}

const sections = [
  {
    heading: '1. Scope',
    paragraphs: [
      'This privacy policy applies to The Sori / Inner Voice mobile application.',
      'The app is a voice-first journal. It uses microphone access only when you intentionally start a voice entry.',
    ],
  },
  {
    heading: '2. Information The App Accesses',
    paragraphs: [
      'The app accesses microphone input when you choose to start voice journaling.',
      'It generates recognized text from that session, stores journal transcripts and generated summaries on your device, and can download AI model files when you install a model.',
    ],
  },
  {
    heading: '3. How Data Is Used',
    paragraphs: [
      'Microphone input is used to create a spoken journal entry.',
      'Recognized text is used to build journal records, grounded reflections, reports, and related summaries inside the app.',
      'Model downloads are used to enable on-device AI features. They are for fetching the model package itself, not for sending your journal transcript to the developer for advertising or profiling.',
    ],
  },
  {
    heading: '4. Storage And Retention',
    paragraphs: [
      'Journal transcripts, wiki files, reports, and related generated content are stored in the app storage on your device.',
      'This data remains available until you delete the stored app data or remove the app.',
    ],
  },
  {
    heading: '5. Sharing And Selling',
    paragraphs: [
      'The app is not designed to sell your personal data.',
      'The repository does not include advertising SDKs or code that intentionally uploads microphone recordings or transcript content for advertising or profiling.',
      'If you choose to download a model, the download request goes to the model hosting service needed to fetch that model file.',
    ],
  },
  {
    heading: '6. Your Choices',
    paragraphs: [
      'You can choose not to grant microphone permission, although voice journaling will then be unavailable.',
      'You can remove stored journal data by clearing the app data or uninstalling the app.',
    ],
  },
  {
    heading: '7. Contact',
    paragraphs: [
      'For privacy questions, contact the developer support address shown on the app listing or contact JMK Contents at bombezzang100@gmail.com.',
    ],
  },
]

const koreanSummary = [
  'The Sori / Inner Voice 앱은 사용자가 직접 음성 기록을 시작할 때만 마이크 권한을 사용합니다.',
  '음성 인식, 저널 생성, 리포트, 대화 기능은 기기에 저장된 저널 데이터를 바탕으로 온디바이스 방식으로 동작하도록 설계되어 있습니다.',
  '저널 전사본과 생성된 콘텐츠는 기기 내부 저장소에 보관되며, 앱 데이터 삭제 또는 앱 제거를 통해 제거할 수 있습니다.',
  '저장소에는 마이크 녹음본이나 전사 내용을 광고 또는 프로파일링 목적으로 개발자에게 전송하는 코드가 포함되어 있지 않습니다.',
]

export default function TheSoriPrivacyPolicyPage() {
  return (
    <div className="container mx-auto max-w-4xl px-4 py-12">
      <div className="mb-8 rounded-lg border bg-card p-6">
        <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-primary">
          Privacy Policy
        </p>
        <h1 className="mb-3 text-4xl font-bold">
          The Sori / Inner Voice Privacy Policy
        </h1>
        <p className="text-sm text-muted-foreground">
          Last updated: April 12, 2026
        </p>
        <p className="mt-4 text-muted-foreground">
          This page is intended for the Google Play listing and for users who
          want to review how The Sori / Inner Voice handles microphone access,
          transcripts, and locally stored journal data.
        </p>
      </div>

      <div className="space-y-6">
        {sections.map((section) => (
          <section key={section.heading} className="rounded-lg border bg-card p-6">
            <h2 className="mb-4 text-2xl font-bold">{section.heading}</h2>
            <div className="space-y-3 text-muted-foreground">
              {section.paragraphs.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          </section>
        ))}

        <section className="rounded-lg border bg-card p-6">
          <h2 className="mb-4 text-2xl font-bold">한국어 요약</h2>
          <div className="space-y-3 text-muted-foreground">
            {koreanSummary.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
