import { AppCard } from '@/components/AppCard'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

// Mock data for demonstration
const featuredApps = [
  {
    bundle_id: 'indsafety_prod',
    app_name: '산업안전산업기사',
    description: '산업안전산업기사 자격증 시험 준비를 위한 기출문제와 음성 듣기 기능을 제공합니다.',
    icon_url: null,
    categories: ['교육', '시험'],
    rating: 4.5,
  },
  {
    bundle_id: 'electrician_prod',
    app_name: '전기기사',
    description: '전기기사 자격증 시험 대비 기출문제 및 학습 자료를 제공합니다.',
    icon_url: null,
    categories: ['교육', '시험'],
    rating: 4.7,
  },
  {
    bundle_id: 'fire_safety_prod',
    app_name: '소방설비기사',
    description: '소방설비기사 자격증 시험을 위한 완벽한 학습 도구입니다.',
    icon_url: null,
    categories: ['교육', '시험'],
    rating: 4.6,
  },
]

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Hero Section */}
      <section className="text-center py-16 space-y-4">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
          한국 자격증 시험 준비
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          30개 이상의 iOS 앱으로 자격증 시험을 효과적으로 준비하세요
        </p>
        <div className="flex gap-4 justify-center pt-4">
          <Link href="/apps">
            <Button size="lg">모든 앱 보기</Button>
          </Link>
          <Link href="/support">
            <Button size="lg" variant="outline">지원 센터</Button>
          </Link>
        </div>
      </section>

      {/* Featured Apps Section */}
      <section className="py-12">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold">추천 앱</h2>
          <Link href="/apps">
            <Button variant="ghost">전체 보기 →</Button>
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredApps.map((app) => (
            <AppCard key={app.bundle_id} app={app} />
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="text-center space-y-2">
          <div className="text-4xl mb-4">📱</div>
          <h3 className="text-xl font-bold">모바일 최적화</h3>
          <p className="text-muted-foreground">
            언제 어디서나 스마트폰으로 편리하게 학습하세요
          </p>
        </div>
        <div className="text-center space-y-2">
          <div className="text-4xl mb-4">🎯</div>
          <h3 className="text-xl font-bold">기출문제</h3>
          <p className="text-muted-foreground">
            실제 시험 기출문제로 효과적인 학습을 제공합니다
          </p>
        </div>
        <div className="text-center space-y-2">
          <div className="text-4xl mb-4">🎧</div>
          <h3 className="text-xl font-bold">음성 듣기</h3>
          <p className="text-muted-foreground">
            이동 중에도 음성으로 학습할 수 있습니다
          </p>
        </div>
      </section>
    </div>
  )
}
