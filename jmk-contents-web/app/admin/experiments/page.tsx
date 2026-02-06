import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { getFirestoreDb } from '@/lib/firebase/admin'
import { COLLECTIONS, AffiliateAd } from '@/lib/firebase/types'
import { Trophy, TrendingUp, AlertTriangle } from 'lucide-react'

export const dynamic = 'force-dynamic'
export const revalidate = 0

interface ExperimentGroup {
  groupName: string
  variants: (AffiliateAd & { id: string; ctr: number })[]
  totalImpressions: number
  totalClicks: number
  avgCTR: number
  winner?: string
}

export default async function ExperimentsPage() {
  const db = getFirestoreDb()
  const adsSnapshot = await db
    .collection(COLLECTIONS.AFFILIATE_ADS)
    .get()

  const ads: (AffiliateAd & { id: string })[] = adsSnapshot.docs
    .map((doc) => {
      const data = doc.data()
      return {
        id: doc.id,
        type: data.type,
        title: data.title,
        imageUrl: data.imageUrl,
        linkUrl: data.linkUrl,
        isActive: data.isActive ?? true,
        priority: data.priority ?? 1,
        startDate: data.startDate ? new Date(data.startDate) : undefined,
        endDate: data.endDate ? new Date(data.endDate) : undefined,
        impressions: data.impressions ?? 0,
        clicks: data.clicks ?? 0,
        appIds: data.appIds ?? ['all'],
        experimentGroup: data.experimentGroup,
        created_at: data.created_at ? new Date(data.created_at) : new Date(),
        updated_at: data.updated_at ? new Date(data.updated_at) : new Date(),
      }
    })
    .filter((ad) => ad.experimentGroup) // 실험 그룹이 있는 광고만

  // 그룹별로 묶기
  const experimentGroups: Record<string, ExperimentGroup> = {}

  ads.forEach((ad) => {
    const groupName = ad.experimentGroup!
    if (!experimentGroups[groupName]) {
      experimentGroups[groupName] = {
        groupName,
        variants: [],
        totalImpressions: 0,
        totalClicks: 0,
        avgCTR: 0,
      }
    }

    const ctr = ad.impressions > 0 ? (ad.clicks / ad.impressions) * 100 : 0

    experimentGroups[groupName].variants.push({
      ...ad,
      ctr,
    })
    experimentGroups[groupName].totalImpressions += ad.impressions
    experimentGroups[groupName].totalClicks += ad.clicks
  })

  // 각 그룹의 평균 CTR 계산 및 승자 선택
  Object.values(experimentGroups).forEach((group) => {
    group.avgCTR = group.totalImpressions > 0
      ? (group.totalClicks / group.totalImpressions) * 100
      : 0

    // 승자 선택 (CTR이 가장 높고, 최소 노출 10회 이상)
    const viableVariants = group.variants.filter((v) => v.impressions >= 10)
    if (viableVariants.length > 0) {
      const winner = viableVariants.reduce((prev, current) =>
        current.ctr > prev.ctr ? current : prev
      )
      group.winner = winner.id
    }

    // CTR 기준으로 정렬
    group.variants.sort((a, b) => b.ctr - a.ctr)
  })

  const experimentGroupsArray = Object.values(experimentGroups)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">A/B 테스트 실험</h1>
          <p className="text-muted-foreground">
            총 {experimentGroupsArray.length}개 실험 그룹
          </p>
        </div>
        <Link href="/admin/affiliate-ads/new">
          <Button className="gap-2">
            <TrendingUp className="w-4 h-4" />
            새 실험 시작
          </Button>
        </Link>
      </div>

      {/* Experiments */}
      {experimentGroupsArray.length > 0 ? (
        <div className="space-y-6">
          {experimentGroupsArray.map((group) => (
            <Card key={group.groupName}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-xl mb-2">
                      {group.groupName}
                    </CardTitle>
                    <div className="flex gap-4 text-sm text-muted-foreground">
                      <span>{group.variants.length}개 Variant</span>
                      <span>•</span>
                      <span>총 노출: {group.totalImpressions.toLocaleString()}</span>
                      <span>•</span>
                      <span>총 클릭: {group.totalClicks.toLocaleString()}</span>
                      <span>•</span>
                      <span>평균 CTR: {group.avgCTR.toFixed(2)}%</span>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {group.variants.map((variant, index) => {
                    const isWinner = variant.id === group.winner
                    const hasMinimumData = variant.impressions >= 10

                    return (
                      <div
                        key={variant.id}
                        className={`p-4 border rounded-lg ${
                          isWinner ? 'bg-green-50 border-green-300' : 'hover:bg-muted/50'
                        } transition-colors`}
                      >
                        <div className="flex items-center gap-4">
                          {/* Rank */}
                          <div className="flex-shrink-0">
                            {isWinner ? (
                              <div className="w-10 h-10 rounded-full bg-green-600 flex items-center justify-center">
                                <Trophy className="w-5 h-5 text-white" />
                              </div>
                            ) : (
                              <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center font-bold text-muted-foreground">
                                {index + 1}
                              </div>
                            )}
                          </div>

                          {/* Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-medium truncate">{variant.title}</h4>
                              {!hasMinimumData && (
                                <span className="flex items-center gap-1 text-xs text-orange-600">
                                  <AlertTriangle className="w-3 h-3" />
                                  샘플 부족
                                </span>
                              )}
                              <span
                                className={`px-2 py-0.5 rounded text-xs ${
                                  variant.type === 'banner'
                                    ? 'bg-blue-100 text-blue-800'
                                    : 'bg-purple-100 text-purple-800'
                                }`}
                              >
                                {variant.type === 'banner' ? '배너' : '전면'}
                              </span>
                              {variant.isActive ? (
                                <span className="px-2 py-0.5 rounded text-xs bg-green-100 text-green-800">
                                  활성
                                </span>
                              ) : (
                                <span className="px-2 py-0.5 rounded text-xs bg-gray-100 text-gray-800">
                                  비활성
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              우선순위: {variant.priority}
                            </div>
                          </div>

                          {/* Stats */}
                          <div className="grid grid-cols-3 gap-6 text-sm text-right">
                            <div>
                              <div className="font-medium">{variant.impressions.toLocaleString()}</div>
                              <div className="text-xs text-muted-foreground">노출</div>
                            </div>
                            <div>
                              <div className="font-medium">{variant.clicks.toLocaleString()}</div>
                              <div className="text-xs text-muted-foreground">클릭</div>
                            </div>
                            <div>
                              <div
                                className={`font-bold text-lg ${
                                  isWinner ? 'text-green-600' : 'text-primary'
                                }`}
                              >
                                {variant.ctr.toFixed(2)}%
                              </div>
                              <div className="text-xs text-muted-foreground">CTR</div>
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex-shrink-0">
                            <Link href={`/admin/affiliate-ads/${variant.id}/edit`}>
                              <Button variant="outline" size="sm">
                                수정
                              </Button>
                            </Link>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>

                {/* Winner Summary */}
                {group.winner && (
                  <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center gap-2 text-green-800">
                      <Trophy className="w-5 h-5" />
                      <span className="font-semibold">
                        승자: {group.variants.find((v) => v.id === group.winner)?.title}
                      </span>
                      <span className="text-sm text-green-600">
                        (최소 10회 노출 기준, 가장 높은 CTR)
                      </span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <TrendingUp className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-lg text-muted-foreground mb-4">
              진행 중인 A/B 테스트가 없습니다
            </p>
            <p className="text-sm text-muted-foreground mb-6">
              광고 생성 시 '실험 그룹' 필드를 입력하여 A/B 테스트를 시작하세요
            </p>
            <Link href="/admin/affiliate-ads/new">
              <Button className="gap-2">
                <TrendingUp className="w-4 h-4" />
                첫 번째 실험 시작하기
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {/* Help Card */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-lg">A/B 테스팅 가이드</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-blue-800">
          <p>
            <strong>1. 실험 시작:</strong> 같은 '실험 그룹'명을 가진 여러 광고를 생성하세요
          </p>
          <p>
            <strong>2. 데이터 수집:</strong> 각 variant가 최소 10회 이상 노출되어야 유의미합니다
          </p>
          <p>
            <strong>3. 승자 선택:</strong> CTR이 가장 높은 variant가 자동으로 승자로 표시됩니다
          </p>
          <p>
            <strong>4. 적용:</strong> 승자를 제외한 다른 variants를 비활성화하거나 삭제하세요
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
