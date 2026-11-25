import { cache } from 'react'
import { getAppsWithContentCounts } from '@/lib/content'
import { countQuestions, getCertContent, getCertSlugs } from '@/lib/cert-content'
import type { SidebarGroup } from '@/components/SiteSidebar'

export interface SiteExam {
  slug: string
  name: string
  category: string
  questionCount: number
  unitCount: number
  conceptCount: number
}

const CATEGORY_ORDER = ['기능사', '산업기사', '기사', '컴퓨터자격증', '기타전문자격증']

// 사이트에 올라온 종목 전체: 종목 정보(Firestore·data/exams)에 콘텐츠 DB 문항 수를 붙인다.
export const getSiteExams = cache(async (): Promise<SiteExam[]> => {
  const [apps, slugs] = await Promise.all([
    getAppsWithContentCounts().catch(() => []),
    getCertSlugs(),
  ])
  const certs = new Map(
    (await Promise.all(slugs.map((slug) => getCertContent(slug))))
      .filter((cert) => cert !== null)
      .map((cert) => [cert.slug, cert])
  )
  const exams = new Map<string, SiteExam>()

  for (const app of apps) {
    const cert = certs.get(app.bundle_id)
    exams.set(app.bundle_id, {
      slug: app.bundle_id,
      name: cert?.name || app.app_name,
      category: cert?.category || app.app_category || '기타전문자격증',
      questionCount: cert ? countQuestions(cert) : 0,
      unitCount: cert ? cert.units.length : 0,
      conceptCount: app.conceptCount,
    })
  }

  // 종목 정보를 못 읽어도 콘텐츠 DB에 있는 종목은 메뉴에 나오게 한다.
  for (const cert of certs.values()) {
    if (!exams.has(cert.slug)) {
      exams.set(cert.slug, {
        slug: cert.slug,
        name: cert.name,
        category: cert.category,
        questionCount: countQuestions(cert),
        unitCount: cert.units.length,
        conceptCount: 0,
      })
    }
  }

  const rank = (category: string) => {
    const index = CATEGORY_ORDER.indexOf(category)
    return index < 0 ? CATEGORY_ORDER.length : index
  }

  return [...exams.values()].sort(
    (left, right) =>
      rank(left.category) - rank(right.category) || left.name.localeCompare(right.name, 'ko')
  )
})

export async function getSidebarGroups(): Promise<SidebarGroup[]> {
  const exams = await getSiteExams()
  const groups = new Map<string, SidebarGroup>()

  for (const exam of exams) {
    if (!groups.has(exam.category)) {
      groups.set(exam.category, { category: exam.category, exams: [] })
    }
    groups.get(exam.category)!.exams.push({
      slug: exam.slug,
      name: exam.name,
      hasCert: exam.questionCount > 0,
      hasConcepts: exam.conceptCount > 0,
    })
  }

  return [...groups.values()]
}
