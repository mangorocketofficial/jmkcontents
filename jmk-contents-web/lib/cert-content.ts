import { promises as fs } from 'node:fs'
import path from 'node:path'
import { cache } from 'react'

// data/cert/<slug>.json. scripts/export-cert-content.mjs가 cert-apps 콘텐츠 DB에서 만든다.

export interface CertQuestion {
  id: string
  unit_id: string
  difficulty: number
  stem: string
  choices: string[]
  answer: number // 1부터
  basis: string
  wrong: Record<string, string>
  point: string
}

export interface CertUnit {
  id: string
  name: string
  subject: string
  weight: number
  subunits: { id: string; name: string }[]
  questions: CertQuestion[]
}

export interface CertContent {
  slug: string
  cert: string
  name: string
  category: string
  authority: { name: string; url: string }
  exam: { question_count: number; time_limit_min: number; pass_count: number }
  weights_are_question_counts: boolean
  ios_url: string
  subjects: string[]
  outline: { id: string; name: string; subject: string; weight: number }[]
  units: CertUnit[]
  ox?: { id: string; statement: string; answer: 0 | 1; explanation: string }[]
  terms?: { term: string; definition: string }[]
}

const CERT_DIR = path.join(process.cwd(), 'data', 'cert')

export const getCertSlugs = cache(async (): Promise<string[]> => {
  try {
    return (await fs.readdir(CERT_DIR))
      .filter((fileName) => fileName.endsWith('.json'))
      .map((fileName) => fileName.replace(/\.json$/, ''))
      .sort()
  } catch {
    return []
  }
})

export const getCertContent = cache(async (slug: string): Promise<CertContent | null> => {
  if (!/^[a-z0-9-]+$/.test(slug)) {
    return null
  }

  try {
    const raw = await fs.readFile(path.join(CERT_DIR, `${slug}.json`), 'utf8')
    return JSON.parse(raw) as CertContent
  } catch {
    return null
  }
})

export function countQuestions(cert: CertContent): number {
  return cert.units.reduce((sum, unit) => sum + unit.questions.length, 0)
}

export interface SummaryGroup {
  id: string
  name: string
  points: string[]
}

// 암기 포인트가 없으면 정답 해설을 사용하고 같은 문장은 세부 단원별로 한 번만 쓴다.
export function buildUnitSummary(unit: CertUnit): SummaryGroup[] {
  const names = new Map<string, string>([
    [unit.id, unit.name],
    ...unit.subunits.map((sub) => [sub.id, sub.name] as [string, string]),
  ])
  const groups = new Map<string, Set<string>>()

  for (const question of unit.questions) {
    const point = question.point.trim() || question.basis.trim()
    if (!point) continue
    if (!groups.has(question.unit_id)) groups.set(question.unit_id, new Set())
    groups.get(question.unit_id)!.add(point)
  }

  return [...names.keys()]
    .filter((id) => groups.has(id))
    .map((id) => ({ id, name: names.get(id)!, points: [...groups.get(id)!] }))
}
