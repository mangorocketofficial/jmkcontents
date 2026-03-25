import { permanentRedirect } from 'next/navigation'

interface ExamLecturesRedirectPageProps {
  params: Promise<{
    bundle_id: string
  }>
}

export default async function ExamLecturesRedirectPage({ params }: ExamLecturesRedirectPageProps) {
  const { bundle_id } = await params
  permanentRedirect(`/exams/${bundle_id}`)
}
