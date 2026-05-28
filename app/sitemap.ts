import type { MetadataRoute } from 'next';
import { prisma } from '@/lib/prisma';

const BASE = (process.env.NEXT_PUBLIC_APP_URL || 'https://bmptsolutions.com').replace(/\/$/, '');

/**
 * Auto-generated sitemap served at /sitemap.xml. Combines:
 *   • the built-in static routes
 *   • every published blog post  (/blog/<slug>)
 *   • every published custom page (/<slug>) created in the admin
 *
 * Everything regenerates on demand — when admins publish content, the
 * next request to /sitemap.xml reflects it.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${BASE}/`,         changeFrequency: 'weekly',  priority: 1.0 },
    { url: `${BASE}/about`,    changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE}/services`, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${BASE}/contact`,  changeFrequency: 'yearly',  priority: 0.6 },
    { url: `${BASE}/blog`,     changeFrequency: 'weekly',  priority: 0.7 },
  ];

  let posts: { slug: string; updatedAt: Date }[] = [];
  let pages: { slug: string; updatedAt: Date }[] = [];

  try {
    [posts, pages] = await Promise.all([
      prisma.blogPost.findMany({
        where: { isPublished: true },
        select: { slug: true, updatedAt: true },
      }),
      prisma.page.findMany({
        where: { isPublished: true },
        select: { slug: true, updatedAt: true },
      }),
    ]);
  } catch {
    /* DB unavailable at build time — ship the static routes only */
  }

  const postRoutes: MetadataRoute.Sitemap = posts.map((p) => ({
    url: `${BASE}/blog/${p.slug}`,
    lastModified: p.updatedAt,
    changeFrequency: 'monthly',
    priority: 0.6,
  }));

  const pageRoutes: MetadataRoute.Sitemap = pages.map((p) => ({
    url: `${BASE}/${p.slug}`,
    lastModified: p.updatedAt,
    changeFrequency: 'monthly',
    priority: 0.7,
  }));

  return [...staticRoutes, ...pageRoutes, ...postRoutes];
}
