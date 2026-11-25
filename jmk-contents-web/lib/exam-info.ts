import { promises as fs } from 'node:fs'
import path from 'node:path'
import { cache } from 'react'

// data/exam-info/<slug>.json. scripts/fetch-exam-info.mjs가 한국산업인력공단 공개 API에서 받아 만든다.
// 파일이 없는 종목(공단 시험이 아닌 종목)은 일정·합격률을 내지 않는다.

export interface ExamPhase {
  apply_start: string // YYYY-MM-DD, 없으면 ''
  apply_end: string
  exam_start: string
  exam_end: string
  result: string
}

export interface ExamScheduleRow {
  year: number
  round: number
  description: string
  written: ExamPhase
  practical: ExamPhase
}

export interface PassRateSide {
  applicants: number
  passed: number
  rate: number
  rounds: number
}

export interface ExamInfo {
  fetched_on: string
  source: { name: string; url: string }
  schedules: ExamScheduleRow[]
  pass_rates: { year: number; written: PassRateSide | null; practical: PassRateSide | null }[]
  how_to: string[]
}

export interface ExamRound {
  year: number
  round: number
  writtenApply: string[] // 접수 기간이 여러 번이면 모두
  written: ExamPhase
  practicalApply: string[]
  practical: ExamPhase
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
      fetched_on: parsed.fetched_on || '',
      source: parsed.source || { name: '', url: '' },
      schedules: parsed.schedules || [],
      pass_rates: parsed.pass_rates || [],
      how_to: parsed.how_to || [],
    }
  } catch {
    return null
  }
})

export function formatRange(start: string, end: string): string {
  const short = (value: string) => value.slice(5).replace('-', '.')
  if (!start) return ''
  return !end || start === end ? short(start) : `${short(start)}~${short(end)}`
}

// 같은 회차가 접수 기간만 다르게 여러 줄로 오므로 회차별로 합친다.
// 회차 100 이상은 정기·상시 검정이 아닌 별도 시행분이라 뺀다.
export function groupRounds(schedules: ExamScheduleRow[]): ExamRound[] {
  const rounds = new Map<string, ExamRound>()

  for (const row of schedules) {
    if (row.round >= 100) continue
    const key = `${row.year}:${row.round}`
    if (!rounds.has(key)) {
      rounds.set(key, {
        year: row.year,
        round: row.round,
        writtenApply: [],
        written: row.written,
        practicalApply: [],
        practical: row.practical,
      })
    }
    const round = rounds.get(key)!
    const written = formatRange(row.written.apply_start, row.written.apply_end)
    const practical = formatRange(row.practical.apply_start, row.practical.apply_end)
    if (written && !round.writtenApply.includes(written)) round.writtenApply.push(written)
    if (practical && !round.practicalApply.includes(practical)) round.practicalApply.push(practical)
    if (!round.practical.exam_start && row.practical.exam_start) round.practical = row.practical
  }

  return [...rounds.values()]
    .map((round) => ({
      ...round,
      writtenApply: [...round.writtenApply].sort(),
      practicalApply: [...round.practicalApply].sort(),
    }))
    .sort((left, right) => left.year - right.year || left.round - right.round)
}
