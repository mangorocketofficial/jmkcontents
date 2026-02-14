'use client'

import { useState, useMemo } from 'react'
import { Lecture, App } from '@/lib/firebase/types'
import { LectureCard } from '@/components/LectureCard'
import { LectureDetailModal } from '@/components/LectureDetailModal'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Search, Filter, X } from 'lucide-react'

interface LectureWithAppName extends Lecture {
  app_name: string
}

interface AllLecturesClientProps {
  lectures: LectureWithAppName[]
  apps: App[]
}

export function AllLecturesClient({ lectures, apps }: AllLecturesClientProps) {
  const [selectedLecture, setSelectedLecture] = useState<Lecture | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [selectedAppId, setSelectedAppId] = useState<string | null>(null)
  const [showFilters, setShowFilters] = useState(false)

  const filteredLectures = useMemo(() => {
    let filtered = [...lectures]

    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (lecture) =>
          lecture.title.toLowerCase().includes(query) ||
          (lecture.description && lecture.description.toLowerCase().includes(query)) ||
          (lecture.transcript && lecture.transcript.toLowerCase().includes(query)) ||
          lecture.app_name.toLowerCase().includes(query)
      )
    }

    if (selectedCategory) {
      filtered = filtered.filter((lecture) => lecture.category === selectedCategory)
    }

    if (selectedAppId) {
      filtered = filtered.filter((lecture) => lecture.app_id === selectedAppId)
    }

    return filtered
  }, [searchQuery, selectedCategory, selectedAppId, lectures])

  const categories = useMemo(
    () => Array.from(new Set(lectures.map((l) => l.category).filter(Boolean))) as string[],
    [lectures]
  )

  return (
    <>
      <Card className="mb-8">
        <CardContent className="pt-6">
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
            <Input
              type="text"
              placeholder="강의 제목, 내용, 과목명 검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-10"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          {(categories.length > 0 || apps.length > 0) && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="mb-4"
            >
              <Filter className="w-4 h-4 mr-2" />
              필터 {showFilters ? '숨기기' : '보기'}
            </Button>
          )}

          {showFilters && (
            <div className="space-y-4 pt-4 border-t">
              {/* 과목 필터 */}
              <div>
                <h3 className="text-sm font-semibold mb-2">자격증 과목</h3>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant={selectedAppId === null ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedAppId(null)}
                  >
                    전체
                  </Button>
                  {apps.map((app) => (
                    <Button
                      key={app.bundle_id}
                      variant={selectedAppId === app.bundle_id ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedAppId(app.bundle_id)}
                    >
                      {app.app_name}
                    </Button>
                  ))}
                </div>
              </div>

              {/* 카테고리 필터 */}
              {categories.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold mb-2">카테고리</h3>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant={selectedCategory === null ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedCategory(null)}
                    >
                      전체
                    </Button>
                    {categories.map((category) => (
                      <Button
                        key={category}
                        variant={selectedCategory === category ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setSelectedCategory(category)}
                      >
                        {category}
                      </Button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="mb-4 text-sm text-muted-foreground">
        {filteredLectures.length}개의 강의
        {(searchQuery || selectedCategory || selectedAppId) && (
          <span> (전체 {lectures.length}개 중)</span>
        )}
      </div>

      {filteredLectures.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredLectures.map((lecture) => (
            <div key={lecture.id}>
              <div className="text-xs text-muted-foreground mb-1 px-1">{lecture.app_name}</div>
              <LectureCard
                lecture={lecture}
                onClick={() => setSelectedLecture(lecture)}
              />
            </div>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-lg text-muted-foreground mb-4">
              {searchQuery || selectedCategory || selectedAppId
                ? '검색 결과가 없습니다.'
                : '등록된 강의가 없습니다.'}
            </p>
            {(searchQuery || selectedCategory || selectedAppId) && (
              <Button
                variant="outline"
                onClick={() => {
                  setSearchQuery('')
                  setSelectedCategory(null)
                  setSelectedAppId(null)
                }}
              >
                필터 초기화
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {selectedLecture && (
        <LectureDetailModal
          lecture={selectedLecture}
          onClose={() => setSelectedLecture(null)}
        />
      )}
    </>
  )
}
