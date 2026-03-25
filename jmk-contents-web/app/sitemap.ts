import type { MetadataRoute } from 'next'
import { getApps } from '@/lib/firebase/apps'
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

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticEntries = createStaticEntries()

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

    return [...staticEntries, ...examEntries]
  } catch (error) {
    console.error('Failed to generate sitemap with app entries:', error)
    return staticEntries
  }
}
