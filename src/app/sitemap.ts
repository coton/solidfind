import { MetadataRoute } from 'next'
import { fetchQuery } from 'convex/nextjs'
import { api } from '../../convex/_generated/api'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://solidfind.vercel.app'

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/reviews`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/sign-in`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/sign-up`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.3,
    },
  ]

  try {
    const companyIds = await fetchQuery(api.companies.listIds)
    const companyPages: MetadataRoute.Sitemap = companyIds.map((c) => ({
      url: `${baseUrl}/profile/${c.id}`,
      lastModified: new Date(c.createdAt),
      changeFrequency: 'weekly' as const,
      priority: 0.9,
    }))
    return [...staticPages, ...companyPages]
  } catch {
    return staticPages
  }
}
