'use client'

import { useState, useMemo } from 'react'
import { Concept, App } from '@/lib/firebase/types'
import { ConceptCard } from '@/components/ConceptCard'
import { ConceptDetailModal } from '@/components/ConceptDetailModal'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Search, Filter, X } from 'lucide-react'

interface ConceptWithAppName extends Concept {
  app_name: string
}

interface AllConceptsClientProps {
  concepts: ConceptWithAppName[]
  apps: App[]
}

export function AllConceptsClient({ concepts, apps }: AllConceptsClientProps) {
  const [selectedConcept, setSelectedConcept] = useState<Concept | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedImportance, setSelectedImportance] = useState<number | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [selectedAppId, setSelectedAppId] = useState<string | null>(null)
  const [showFilters, setShowFilters] = useState(false)

  const filteredConcepts = useMemo(() => {
    let filtered = [...concepts]

    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (concept) =>
          concept.title.toLowerCase().includes(query) ||
          concept.content.toLowerCase().includes(query) ||
          concept.keywords.toLowerCase().includes(query) ||
          concept.app_name.toLowerCase().includes(query)
      )
    }

    if (selectedImportance !== null) {
      filtered = filtered.filter((concept) => concept.importance === selectedImportance)
    }

    if (selectedCategory) {
      filtered = filtered.filter((concept) => concept.category === selectedCategory)
    }

    if (selectedAppId) {
      filtered = filtered.filter((concept) => concept.app_id === selectedAppId)
    }

    return filtered
  }, [searchQuery, selectedImportance, selectedCategory, selectedAppId, concepts])

  const categories = useMemo(
    () => Array.from(new Set(concepts.map((c) => c.category))).filter(Boolean),
    [concepts]
  )

  return (
    <>
      <Card className="mb-8">
        <CardContent className="pt-6">
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
            <Input
              type="text"
              placeholder="개념, 키워드, 과목명 검색..."
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

          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className="mb-4"
          >
            <Filter className="w-4 h-4 mr-2" />
            필터 {showFilters ? '숨기기' : '보기'}
          </Button>

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

              {/* 중요도 필터 */}
              <div>
                <h3 className="text-sm font-semibold mb-2">중요도</h3>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant={selectedImportance === null ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedImportance(null)}
                  >
                    전체
                  </Button>
                  {[5, 4, 3, 2, 1].map((importance) => (
                    <Button
                      key={importance}
                      variant={selectedImportance === importance ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedImportance(importance)}
                    >
                      {'⭐'.repeat(importance)}
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
        {filteredConcepts.length}개의 개념
        {(searchQuery || selectedImportance !== null || selectedCategory || selectedAppId) && (
          <span> (전체 {concepts.length}개 중)</span>
        )}
      </div>

      {filteredConcepts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredConcepts.map((concept) => (
            <div key={concept.id}>
              <div className="text-xs text-muted-foreground mb-1 px-1">{concept.app_name}</div>
              <ConceptCard
                concept={concept}
                onClick={() => setSelectedConcept(concept)}
              />
            </div>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-lg text-muted-foreground mb-4">
              {searchQuery || selectedImportance !== null || selectedCategory || selectedAppId
                ? '검색 결과가 없습니다.'
                : '등록된 개념이 없습니다.'}
            </p>
            {(searchQuery || selectedImportance !== null || selectedCategory || selectedAppId) && (
              <Button
                variant="outline"
                onClick={() => {
                  setSearchQuery('')
                  setSelectedImportance(null)
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

      {selectedConcept && (
        <ConceptDetailModal
          concept={selectedConcept}
          onClose={() => setSelectedConcept(null)}
        />
      )}
    </>
  )
}
