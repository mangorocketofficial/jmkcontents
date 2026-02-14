'use client'

import { useState } from 'react'
import { App, APP_CATEGORIES, AppCategory } from '@/lib/firebase/types'
import { ExamCard } from './ExamCard'

interface ExamWithCounts extends App {
  conceptCount: number
  lectureCount: number
}

interface ExamsClientProps {
  exams: ExamWithCounts[]
}

export function ExamsClient({ exams }: ExamsClientProps) {
  const [selectedCategory, setSelectedCategory] = useState<AppCategory | 'all'>('all')

  const filteredExams = selectedCategory === 'all'
    ? exams
    : exams.filter(exam => exam.app_category === selectedCategory)

  const categoryCounts = APP_CATEGORIES.reduce((acc, cat) => {
    acc[cat] = exams.filter(exam => exam.app_category === cat).length
    return acc
  }, {} as Record<string, number>)

  return (
    <div>
      {/* 필터 탭 */}
      <div className="flex flex-wrap gap-2 mb-8">
        <button
          onClick={() => setSelectedCategory('all')}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
            selectedCategory === 'all'
              ? 'bg-primary text-primary-foreground'
              : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
          }`}
        >
          전체 ({exams.length})
        </button>
        {APP_CATEGORIES.map((category) => (
          categoryCounts[category] > 0 && (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                selectedCategory === category
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
              }`}
            >
              {category} ({categoryCounts[category]})
            </button>
          )
        ))}
      </div>

      {/* 과목 그리드 */}
      {filteredExams.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredExams.map((exam) => (
            <ExamCard
              key={exam.bundle_id}
              app={exam}
              conceptCount={exam.conceptCount}
              lectureCount={exam.lectureCount}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-lg text-muted-foreground">
            해당 분류의 과목이 없습니다.
          </p>
        </div>
      )}
    </div>
  )
}
