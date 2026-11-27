import type { MetadataRoute } from 'next'
import { getApps } from '@/lib/content'
import { getCertContent, getCertSlugs } from '@/lib/cert-content'
import { SITE_URL } from '@/lib/site'

export const revalidate = 3600

function createStaticEntries(): MetadataRoute.Sitemap {
  const now = new Date()

  return [
    {
      url: SITE_URL,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${SITE_URL}/exams`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/concepts`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/about`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${SITE_URL}/contact`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${SITE_URL}/privacy`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.4,
    },
    {
      url: `${SITE_URL}/support`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${SITE_URL}/terms`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.4,
    },
  ]
}

// 콘텐츠 DB에서 만든 예상문제·핵심요약·시험 정보 페이지.
async function createCertEntries(): Promise<MetadataRoute.Sitemap> {
  const slugs = await getCertSlugs()
  const certs = await Promise.all(slugs.map((slug) => getCertContent(slug)))
  const lastModified = new Date()

  return certs.flatMap((cert) => {
    if (!cert) return []
    const base = `${SITE_URL}/exams/${cert.slug}`

    return [
      { url: base, lastModified, changeFrequency: 'weekly' as const, priority: 0.8 },
      { url: `${base}/summary`, lastModified, changeFrequency: 'monthly' as const, priority: 0.8 },
      { url: `${base}/info`, lastModified, changeFrequency: 'monthly' as const, priority: 0.7 },
      ...cert.units.map((unit) => ({
        url: `${base}/questions/${unit.id}`,
        lastModified,
        changeFrequency: 'monthly' as const,
        priority: 0.7,
      })),
    ]
  })
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticEntries = [...createStaticEntries(), ...(await createCertEntries())]

  try {
    const apps = await getApps()
    const examEntries = apps.flatMap((app) => {
      const lastModified = app.updated_at || app.created_at || new Date()

      return [
        {
          url: `${SITE_URL}/exams/${app.bundle_id}`,
          lastModified,
          changeFrequency: 'weekly' as const,
          priority: 0.8,
        },
        {
          url: `${SITE_URL}/exams/${app.bundle_id}/concepts`,
          lastModified,
          changeFrequency: 'weekly' as const,
          priority: 0.7,
        },
      ]
    })

    return [...new Map([...staticEntries, ...examEntries].map((entry) => [entry.url, entry])).values()]
  } catch (error) {
    console.error('Failed to generate sitemap with app entries:', error)
    return staticEntries
  }
}
