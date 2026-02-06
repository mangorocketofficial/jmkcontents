'use client'

import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { createApp } from '@/app/actions/apps'
import { Loader2, ArrowLeft, AlertCircle, CheckCircle2 } from 'lucide-react'
import Link from 'next/link'

export default function NewAppPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<{
    type: 'success' | 'error' | null
    message: string
  }>({ type: null, message: '' })

  const [formData, setFormData] = useState({
    bundle_id: '',
    app_name: '',
    app_name_full: '',
    description: '',
    description_full: '',
    app_store_url: '',
    icon_url: '',
    categories: '',
    status: 'draft' as 'draft' | 'published',
    is_featured: false,
    rating: 0,
    download_count: 0,
  })

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitStatus({ type: null, message: '' })

    try {
      // categories를 배열로 변환
      const categories = formData.categories
        ? formData.categories.split(',').map((c) => c.trim()).filter(Boolean)
        : []

      const result = await createApp({
        ...formData,
        categories,
      })

      if (result.success) {
        setSubmitStatus({ type: 'success', message: result.message })
        setTimeout(() => {
          router.push('/admin/apps')
          router.refresh()
        }, 1500)
      } else {
        setSubmitStatus({ type: 'error', message: result.message })
      }
    } catch (error) {
      console.error('Form submission error:', error)
      setSubmitStatus({
        type: 'error',
        message: 'App 생성 중 오류가 발생했습니다.',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/admin/apps">
          <Button variant="ghost" size="sm" className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            뒤로
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">새 앱 추가</h1>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>앱 정보</CardTitle>
          <CardDescription>
            새로운 앱의 정보를 입력하세요. * 표시는 필수 항목입니다.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Status Messages */}
          {submitStatus.type && (
            <div
              className={`mb-6 p-4 rounded-lg flex items-start gap-3 ${
                submitStatus.type === 'success'
                  ? 'bg-green-50 text-green-800 border border-green-200'
                  : 'bg-red-50 text-red-800 border border-red-200'
              }`}
            >
              {submitStatus.type === 'success' ? (
                <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              )}
              <p className="text-sm">{submitStatus.message}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Bundle ID */}
            <div>
              <label htmlFor="bundle_id" className="block text-sm font-medium mb-2">
                Bundle ID * (예: indsafety)
              </label>
              <Input
                id="bundle_id"
                value={formData.bundle_id}
                onChange={(e) => setFormData({ ...formData, bundle_id: e.target.value })}
                placeholder="indsafety"
                required
                disabled={isSubmitting}
              />
              <p className="text-xs text-muted-foreground mt-1">
                iOS 번들 ID의 마지막 부분 (com.eggsoft.indsafety → indsafety)
              </p>
            </div>

            {/* App Name */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="app_name" className="block text-sm font-medium mb-2">
                  앱 이름 * (짧은 버전)
                </label>
                <Input
                  id="app_name"
                  value={formData.app_name}
                  onChange={(e) => setFormData({ ...formData, app_name: e.target.value })}
                  placeholder="산업안전기사"
                  required
                  disabled={isSubmitting}
                />
              </div>
              <div>
                <label htmlFor="app_name_full" className="block text-sm font-medium mb-2">
                  앱 이름 (전체)
                </label>
                <Input
                  id="app_name_full"
                  value={formData.app_name_full}
                  onChange={(e) =>
                    setFormData({ ...formData, app_name_full: e.target.value })
                  }
                  placeholder="산업안전기사 필기 CBT"
                  disabled={isSubmitting}
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium mb-2">
                설명 (짧은 버전)
              </label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="산업안전기사 필기 시험 대비 앱"
                rows={3}
                disabled={isSubmitting}
              />
            </div>

            <div>
              <label htmlFor="description_full" className="block text-sm font-medium mb-2">
                설명 (전체)
              </label>
              <Textarea
                id="description_full"
                value={formData.description_full}
                onChange={(e) =>
                  setFormData({ ...formData, description_full: e.target.value })
                }
                placeholder="산업안전기사 필기 시험을 효과적으로 준비할 수 있는 앱입니다..."
                rows={5}
                disabled={isSubmitting}
              />
            </div>

            {/* URLs */}
            <div>
              <label htmlFor="app_store_url" className="block text-sm font-medium mb-2">
                App Store URL
              </label>
              <Input
                id="app_store_url"
                type="url"
                value={formData.app_store_url}
                onChange={(e) =>
                  setFormData({ ...formData, app_store_url: e.target.value })
                }
                placeholder="https://apps.apple.com/..."
                disabled={isSubmitting}
              />
            </div>

            <div>
              <label htmlFor="icon_url" className="block text-sm font-medium mb-2">
                아이콘 URL
              </label>
              <Input
                id="icon_url"
                type="url"
                value={formData.icon_url}
                onChange={(e) => setFormData({ ...formData, icon_url: e.target.value })}
                placeholder="https://..."
                disabled={isSubmitting}
              />
            </div>

            {/* Categories */}
            <div>
              <label htmlFor="categories" className="block text-sm font-medium mb-2">
                카테고리 (쉼표로 구분)
              </label>
              <Input
                id="categories"
                value={formData.categories}
                onChange={(e) => setFormData({ ...formData, categories: e.target.value })}
                placeholder="산업안전, 기사, 자격증"
                disabled={isSubmitting}
              />
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="rating" className="block text-sm font-medium mb-2">
                  평점 (0-5)
                </label>
                <Input
                  id="rating"
                  type="number"
                  min="0"
                  max="5"
                  step="0.1"
                  value={formData.rating}
                  onChange={(e) =>
                    setFormData({ ...formData, rating: parseFloat(e.target.value) || 0 })
                  }
                  disabled={isSubmitting}
                />
              </div>
              <div>
                <label htmlFor="download_count" className="block text-sm font-medium mb-2">
                  다운로드 수
                </label>
                <Input
                  id="download_count"
                  type="number"
                  min="0"
                  value={formData.download_count}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      download_count: parseInt(e.target.value) || 0,
                    })
                  }
                  disabled={isSubmitting}
                />
              </div>
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium mb-2">상태 *</label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="status"
                    value="draft"
                    checked={formData.status === 'draft'}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        status: e.target.value as 'draft' | 'published',
                      })
                    }
                    disabled={isSubmitting}
                  />
                  <span>비공개 (Draft)</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="status"
                    value="published"
                    checked={formData.status === 'published'}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        status: e.target.value as 'draft' | 'published',
                      })
                    }
                    disabled={isSubmitting}
                  />
                  <span>공개 (Published)</span>
                </label>
              </div>
            </div>

            {/* Is Featured */}
            <div>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.is_featured}
                  onChange={(e) =>
                    setFormData({ ...formData, is_featured: e.target.checked })
                  }
                  disabled={isSubmitting}
                />
                <span className="text-sm font-medium">추천 앱으로 표시</span>
              </label>
            </div>

            {/* Submit */}
            <div className="flex gap-4 pt-4">
              <Button type="submit" disabled={isSubmitting} className="flex-1">
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    생성 중...
                  </>
                ) : (
                  '앱 생성'
                )}
              </Button>
              <Link href="/admin/apps" className="flex-1">
                <Button type="button" variant="outline" className="w-full" disabled={isSubmitting}>
                  취소
                </Button>
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
