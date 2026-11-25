'use client'

import { useMemo, useState } from 'react'
import type { Concept } from '@/lib/firebase/types'
import { ConceptDetailModal } from '@/components/ConceptDetailModal'

type BoardConcept = Concept & { app_name?: string }

interface ConceptBoardProps {
  concepts: BoardConcept[]
  showExam?: boolean // 여러 종목을 한 목록에 보일 때 종목 칸을 낸다
}

const PAGE_SIZE = 30
const selectClass = 'border bg-background px-2 py-1.5 text-sm'

// 핵심개념 게시판: 검색·분류 고르기 + 목록. 줄을 누르면 내용이 열린다.
export function ConceptBoard({ concepts, showExam = false }: ConceptBoardProps) {
  const [selected, setSelected] = useState<Concept | null>(null)
  const [query, setQuery] = useState('')
  const [examId, setExamId] = useState('')
  const [category, setCategory] = useState('')
  const [importance, setImportance] = useState('')
  const [page, setPage] = useState(1)

  const exams = useMemo(() => {
    const names = new Map<string, string>()
    concepts.forEach((concept) => names.set(concept.app_id, concept.app_name || concept.app_id))
    return [...names.entries()].sort((left, right) => left[1].localeCompare(right[1], 'ko'))
  }, [concepts])

  const categories = useMemo(() => {
    const scoped = examId ? concepts.filter((concept) => concept.app_id === examId) : concepts
    return [...new Set(scoped.map((concept) => concept.category).filter(Boolean))].sort((left, right) =>
      left.localeCompare(right, 'ko')
    )
  }, [concepts, examId])

  const filtered = useMemo(() => {
    const text = query.trim().toLowerCase()

    return concepts.filter(
      (concept) =>
        (!examId || concept.app_id === examId) &&
        (!category || concept.category === category) &&
        (!importance || concept.importance === Number(importance)) &&
        (!text ||
          concept.title.toLowerCase().includes(text) ||
          concept.content.toLowerCase().includes(text) ||
          concept.keywords.toLowerCase().includes(text))
    )
  }, [concepts, query, examId, category, importance])

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const current = Math.min(page, pageCount)
  const rows = filtered.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE)
  const update = (apply: () => void) => {
    apply()
    setPage(1)
  }

  return (
    <>
      <div className="flex flex-wrap items-center gap-2 border-b bg-muted/40 px-2 py-2">
        {showExam && (
          <select
            aria-label="종목"
            value={examId}
            onChange={(event) => update(() => { setExamId(event.target.value); setCategory('') })}
            className={selectClass}
          >
            <option value="">전체 종목</option>
            {exams.map(([id, name]) => (
              <option key={id} value={id}>{name}</option>
            ))}
          </select>
        )}
        <select
          aria-label="과목"
          value={category}
          onChange={(event) => update(() => setCategory(event.target.value))}
          className={selectClass}
        >
          <option value="">전체 과목</option>
          {categories.map((name) => (
            <option key={name} value={name}>{name}</option>
          ))}
        </select>
        <select
          aria-label="중요도"
          value={importance}
          onChange={(event) => update(() => setImportance(event.target.value))}
          className={selectClass}
        >
          <option value="">전체 중요도</option>
          {[5, 4, 3, 2, 1].map((level) => (
            <option key={level} value={level}>중요도 {level}</option>
          ))}
        </select>
        <input
          type="search"
          aria-label="검색"
          placeholder="제목, 내용, 키워드 검색"
          value={query}
          onChange={(event) => update(() => setQuery(event.target.value))}
          className="min-w-0 flex-1 border bg-background px-2 py-1.5 text-sm"
        />
      </div>

      <table className="w-full table-fixed text-sm">
        <thead className="border-b text-xs text-muted-foreground">
          <tr>
            <th className="w-12 px-2 py-2 font-normal">번호</th>
            {showExam && <th className="hidden w-32 px-2 py-2 text-left font-normal md:table-cell">종목</th>}
            <th className="hidden w-36 px-2 py-2 text-left font-normal sm:table-cell">과목</th>
            <th className="px-2 py-2 text-left font-normal">제목</th>
            <th className="w-16 px-2 py-2 text-right font-normal">중요도</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((concept, index) => (
            <tr key={`${concept.app_id}:${concept.id}`} className="border-b hover:bg-muted/30">
              <td className="px-2 py-2 text-center text-xs text-muted-foreground tabular-nums">
                {filtered.length - (current - 1) * PAGE_SIZE - index}
              </td>
              {showExam && (
                <td className="hidden truncate px-2 py-2 text-xs text-muted-foreground md:table-cell">
                  {concept.app_name}
                </td>
              )}
              <td className="hidden truncate px-2 py-2 text-xs text-muted-foreground sm:table-cell">
                {concept.category}
              </td>
              <td className="truncate px-2 py-2">
                <button
                  type="button"
                  onClick={() => setSelected(concept)}
                  className="max-w-full truncate text-left hover:underline"
                >
                  {concept.title}
                </button>
              </td>
              <td className="px-2 py-2 text-right text-xs tabular-nums text-emerald-700">
                {'★'.repeat(concept.importance)}
              </td>
            </tr>
          ))}
          {rows.length === 0 && (
            <tr>
              <td colSpan={5} className="py-12 text-center text-muted-foreground">
                {concepts.length === 0 ? '등록된 핵심개념이 아직 없습니다.' : '조건에 맞는 글이 없습니다.'}
              </td>
            </tr>
          )}
        </tbody>
      </table>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-sm">
        <span className="text-xs text-muted-foreground">
          {filtered.length.toLocaleString()}개
          {filtered.length !== concepts.length && ` (전체 ${concepts.length.toLocaleString()}개 중)`}
        </span>
        {pageCount > 1 && (
          <nav aria-label="쪽" className="flex flex-wrap gap-1">
            {Array.from({ length: pageCount }, (_, index) => index + 1)
              .filter((number) => number === 1 || number === pageCount || Math.abs(number - current) <= 4)
              .map((number, index, list) => (
                <span key={number} className="flex items-center gap-1">
                  {index > 0 && number - list[index - 1] > 1 && <span className="text-muted-foreground">…</span>}
                  <button
                    type="button"
                    onClick={() => setPage(number)}
                    aria-current={number === current ? 'page' : undefined}
                    className={`min-w-7 border px-1.5 py-0.5 tabular-nums ${
                      number === current ? 'border-foreground font-bold' : 'text-muted-foreground hover:bg-muted/50'
                    }`}
                  >
                    {number}
                  </button>
                </span>
              ))}
          </nav>
        )}
      </div>

      {selected && <ConceptDetailModal concept={selected} onClose={() => setSelected(null)} />}
    </>
  )
}
