import { promises as fs } from 'node:fs'
import path from 'node:path'
import { cache } from 'react'

// data/exam-info/<slug>.json. 시행처 공고를 보고 사람이 채운다. 파일이 없으면 일정 표를 내지 않는다.
export interface ExamInfo {
  verified_on: string // 공고를 확인한 날짜 (YYYY-MM-DD)
  source_url?: string // 확인한 공고 주소
  schedules: { round: string; apply: string; exam: string; result: string }[]
  notes: { title: string; body: string }[] // 응시 방법, 준비물, 합격률 등
}

const INFO_DIR = path.join(process.cwd(), 'data', 'exam-info')

export const getExamInfo = cache(async (slug: string): Promise<ExamInfo | null> => {
  if (!/^[a-z0-9-]+$/.test(slug)) {
    return null
  }

  try {
    const raw = await fs.readFile(path.join(INFO_DIR, `${slug}.json`), 'utf8')
    const parsed = JSON.parse(raw) as Partial<ExamInfo>
    return {
      verified_on: parsed.verified_on || '',
      source_url: parsed.source_url,
      schedules: parsed.schedules || [],
      notes: parsed.notes || [],
    }
  } catch {
    return null
  }
})
