import { AppCard } from '@/components/AppCard'

// Mock data - will be replaced with Supabase data later
const allApps = [
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
  {
    bundle_id: 'construction_prod',
    app_name: '건축기사',
    description: '건축기사 자격증 시험 준비를 위한 종합 학습 앱입니다.',
    icon_url: null,
    categories: ['교육', '시험'],
    rating: 4.4,
  },
  {
    bundle_id: 'mechanical_prod',
    app_name: '기계기사',
    description: '기계기사 자격증 취득을 위한 필수 학습 자료를 제공합니다.',
    icon_url: null,
    categories: ['교육', '시험'],
    rating: 4.5,
  },
  {
    bundle_id: 'environment_prod',
    app_name: '환경기사',
    description: '환경기사 자격증 시험의 모든 과목을 체계적으로 학습할 수 있습니다.',
    icon_url: null,
    categories: ['교육', '시험'],
    rating: 4.3,
  },
]

export default function AppsPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-12">
        <h1 className="text-4xl font-bold mb-4">모든 앱</h1>
        <p className="text-xl text-muted-foreground">
          자격증 시험 준비를 위한 {allApps.length}개의 전문 학습 앱
        </p>
      </div>

      {/* Filter/Category Section - To be implemented */}
      <div className="mb-8">
        <div className="flex gap-2 flex-wrap">
          <button className="px-4 py-2 bg-primary text-primary-foreground rounded-lg">
            전체
          </button>
          <button className="px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80">
            산업안전
          </button>
          <button className="px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80">
            전기
          </button>
          <button className="px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80">
            소방
          </button>
          <button className="px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80">
            건축
          </button>
          <button className="px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80">
            기타
          </button>
        </div>
      </div>

      {/* Apps Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {allApps.map((app) => (
          <AppCard key={app.bundle_id} app={app} />
        ))}
      </div>

      {/* Empty State (when filtering returns no results) */}
      {allApps.length === 0 && (
        <div className="text-center py-12">
          <p className="text-lg text-muted-foreground">
            해당 카테고리의 앱이 없습니다.
          </p>
        </div>
      )}
    </div>
  )
}
