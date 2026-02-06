import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { getFirestoreDb } from '@/lib/firebase/admin'
import { COLLECTIONS, Concept } from '@/lib/firebase/types'
import { BookOpen, Plus, Star } from 'lucide-react'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function AdminConceptsPage() {
  const db = getFirestoreDb()
  const conceptsSnapshot = await db
    .collection(COLLECTIONS.CONCEPTS)
    .orderBy('created_at', 'desc')
    .limit(50)
    .get()

  const concepts: (Concept & { id: string })[] = conceptsSnapshot.docs.map((doc) => ({
    id: doc.id,
    app_id: doc.data().app_id,
    category: doc.data().category,
    title: doc.data().title,
    content: doc.data().content,
    importance: doc.data().importance,
    keywords: doc.data().keywords || '',
    study_note: doc.data().study_note || '',
    created_at: doc.data().created_at?.toDate() || new Date(),
    updated_at: doc.data().updated_at?.toDate() || new Date(),
  }))

  const totalCount = conceptsSnapshot.size
  const byImportance = {
    5: concepts.filter((c) => c.importance === 5).length,
    4: concepts.filter((c) => c.importance === 4).length,
    3: concepts.filter((c) => c.importance === 3).length,
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Concepts 관리</h1>
          <p className="text-muted-foreground">등록된 개념: {totalCount}개</p>
        </div>
        <Button className="gap-2" disabled>
          <Plus className="w-4 h-4" />
          새 개념 추가 (준비 중)
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold mb-1">{byImportance[5]}</div>
            <div className="text-sm text-muted-foreground">중요도 ⭐⭐⭐⭐⭐</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold mb-1">{byImportance[4]}</div>
            <div className="text-sm text-muted-foreground">중요도 ⭐⭐⭐⭐</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold mb-1">{byImportance[3]}</div>
            <div className="text-sm text-muted-foreground">중요도 ⭐⭐⭐</div>
          </CardContent>
        </Card>
      </div>

      {/* Concepts List */}
      {concepts.length > 0 ? (
        <div className="space-y-4">
          {concepts.map((concept) => (
            <Card key={concept.id}>
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <CardTitle className="text-lg">{concept.title}</CardTitle>
                      <span className="text-yellow-600">
                        {'⭐'.repeat(concept.importance)}
                      </span>
                      {concept.category && (
                        <span className="px-2 py-1 bg-secondary text-secondary-foreground rounded text-xs">
                          {concept.category}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>App: {concept.app_id}</span>
                      <span>•</span>
                      <span>{new Date(concept.created_at).toLocaleDateString('ko-KR')}</span>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm line-clamp-2 mb-3">{concept.content}</p>
                {concept.keywords && (
                  <div className="flex flex-wrap gap-2">
                    {concept.keywords.split(',').map((keyword, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-1 bg-muted rounded text-xs text-muted-foreground"
                      >
                        {keyword.trim()}
                      </span>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <BookOpen className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-lg text-muted-foreground mb-4">등록된 개념이 없습니다</p>
            <Button disabled className="gap-2">
              <Plus className="w-4 h-4" />
              첫 번째 개념 추가하기 (준비 중)
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Note */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <p className="text-sm text-blue-800">
            💡 <strong>안내:</strong> Concepts CRUD 기능은 현재 개발 중입니다. Firebase
            Console에서 직접 관리하실 수 있습니다.
          </p>
          <a
            href="https://console.firebase.google.com/project/exam-affiliate-ads/firestore/databases/-default-/data/~2Fconcepts"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-blue-600 hover:underline mt-2 inline-block"
          >
            Firebase Console에서 관리하기 →
          </a>
        </CardContent>
      </Card>
    </div>
  )
}
