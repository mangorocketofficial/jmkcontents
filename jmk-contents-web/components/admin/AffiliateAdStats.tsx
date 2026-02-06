'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AffiliateAd } from '@/lib/firebase/types'

interface AffiliateAdStatsProps {
  ads: (AffiliateAd & { id: string })[]
}

export function AffiliateAdStats({ ads }: AffiliateAdStatsProps) {
  // 앱별 통계 계산
  const appStats = ads.reduce((acc, ad) => {
    ad.appIds.forEach((appId) => {
      if (!acc[appId]) {
        acc[appId] = { impressions: 0, clicks: 0, adCount: 0 }
      }
      acc[appId].impressions += ad.impressions
      acc[appId].clicks += ad.clicks
      acc[appId].adCount += 1
    })
    return acc
  }, {} as Record<string, { impressions: number; clicks: number; adCount: number }>)

  const appStatsArray = Object.entries(appStats)
    .map(([appId, stats]) => ({
      appId,
      ...stats,
      ctr: stats.impressions > 0 ? ((stats.clicks / stats.impressions) * 100).toFixed(2) : '0.00',
    }))
    .sort((a, b) => b.clicks - a.clicks)

  // 타입별 통계
  const typeStats = ads.reduce(
    (acc, ad) => {
      if (ad.type === 'banner') {
        acc.banner.count += 1
        acc.banner.impressions += ad.impressions
        acc.banner.clicks += ad.clicks
      } else {
        acc.interstitial.count += 1
        acc.interstitial.impressions += ad.impressions
        acc.interstitial.clicks += ad.clicks
      }
      return acc
    },
    {
      banner: { count: 0, impressions: 0, clicks: 0 },
      interstitial: { count: 0, impressions: 0, clicks: 0 },
    }
  )

  const bannerCTR = typeStats.banner.impressions > 0
    ? ((typeStats.banner.clicks / typeStats.banner.impressions) * 100).toFixed(2)
    : '0.00'

  const interstitialCTR = typeStats.interstitial.impressions > 0
    ? ((typeStats.interstitial.clicks / typeStats.interstitial.impressions) * 100).toFixed(2)
    : '0.00'

  // 상위 성과 광고 (CTR 기준)
  const topAds = ads
    .filter((ad) => ad.impressions > 10) // 최소 노출 수 필터
    .map((ad) => ({
      ...ad,
      ctr: ad.impressions > 0 ? (ad.clicks / ad.impressions) * 100 : 0,
    }))
    .sort((a, b) => b.ctr - a.ctr)
    .slice(0, 5)

  return (
    <div className="space-y-6">
      {/* 타입별 성과 비교 */}
      <Card>
        <CardHeader>
          <CardTitle>타입별 성과 비교</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-6">
            {/* Banner */}
            <div className="border rounded-lg p-4">
              <h3 className="text-lg font-semibold mb-3 text-blue-600">배너 광고</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">광고 수:</span>
                  <span className="font-medium">{typeStats.banner.count}개</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">총 노출:</span>
                  <span className="font-medium">
                    {typeStats.banner.impressions.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">총 클릭:</span>
                  <span className="font-medium">
                    {typeStats.banner.clicks.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between pt-2 border-t">
                  <span className="text-muted-foreground">평균 CTR:</span>
                  <span className="font-bold text-blue-600">{bannerCTR}%</span>
                </div>
              </div>
            </div>

            {/* Interstitial */}
            <div className="border rounded-lg p-4">
              <h3 className="text-lg font-semibold mb-3 text-purple-600">전면 광고</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">광고 수:</span>
                  <span className="font-medium">{typeStats.interstitial.count}개</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">총 노출:</span>
                  <span className="font-medium">
                    {typeStats.interstitial.impressions.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">총 클릭:</span>
                  <span className="font-medium">
                    {typeStats.interstitial.clicks.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between pt-2 border-t">
                  <span className="text-muted-foreground">평균 CTR:</span>
                  <span className="font-bold text-purple-600">{interstitialCTR}%</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 앱별 성과 */}
      <Card>
        <CardHeader>
          <CardTitle>앱별 광고 성과</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {appStatsArray.length > 0 ? (
              appStatsArray.map((stat) => (
                <div
                  key={stat.appId}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex-1">
                    <div className="font-medium mb-1">
                      {stat.appId === 'all' ? '🌐 모든 앱' : `📱 ${stat.appId}`}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {stat.adCount}개 광고
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-sm text-right">
                    <div>
                      <div className="font-medium">{stat.impressions.toLocaleString()}</div>
                      <div className="text-xs text-muted-foreground">노출</div>
                    </div>
                    <div>
                      <div className="font-medium">{stat.clicks.toLocaleString()}</div>
                      <div className="text-xs text-muted-foreground">클릭</div>
                    </div>
                    <div>
                      <div className="font-bold text-primary">{stat.ctr}%</div>
                      <div className="text-xs text-muted-foreground">CTR</div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-muted-foreground py-8">
                통계 데이터가 없습니다
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* 상위 성과 광고 */}
      {topAds.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>상위 성과 광고 (CTR 기준)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topAds.map((ad, index) => (
                <div
                  key={ad.id}
                  className="flex items-center gap-4 p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">{ad.title}</div>
                    <div className="text-xs text-muted-foreground">
                      {ad.type === 'banner' ? '배너' : '전면'}
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-sm text-right">
                    <div>
                      <div className="font-medium">{ad.impressions.toLocaleString()}</div>
                      <div className="text-xs text-muted-foreground">노출</div>
                    </div>
                    <div>
                      <div className="font-medium">{ad.clicks.toLocaleString()}</div>
                      <div className="text-xs text-muted-foreground">클릭</div>
                    </div>
                    <div>
                      <div className="font-bold text-green-600">{ad.ctr.toFixed(2)}%</div>
                      <div className="text-xs text-muted-foreground">CTR</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
