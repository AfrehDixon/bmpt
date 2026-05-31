import { cache } from 'react';
import { prisma } from './prisma';
import { cached } from './redis';

/**
 * Read-through CMS data access for the public site.
 *
 * Three layers of caching so a single page render touches Postgres at
 * most once per cache key per ~10 minutes:
 *
 *   L1  React  cache()       request-scoped, in-memory, free
 *                            → dedupes calls within one render pass
 *                              (layout + page + components share one fetch)
 *
 *   L2  Redis  cached()      process-wide, cross-instance
 *                            → all PM2 workers share one cache;
 *                              survives restarts; flushed on admin writes
 *
 *   L3  Next.js revalidate   cross-request, per-route ISR
 *                            → pages set `export const revalidate = 300`
 *                              so the rendered HTML is reused for 5 min
 *
 * Admin writes call `clearCmsCache()` (drops every `cms:*` key in Redis)
 * and `revalidatePath('/', 'layout')` (drops Next's ISR cache), so
 * content changes appear on the public site within seconds.
 */

// ── TTLs ───────────────────────────────────────────────────────
// Tune here — anything you bump here cuts DB load proportionally.
const TTL = {
  STABLE: 600,   // 10 min — settings, hero, services, features, about, vendors, stats, nav, SEO
  MEDIUM: 300,   // 5 min  — blog list, individual posts, custom pages
  REACTIVE: 90,  // 1.5 min — banners, promotions (need to feel "live")
} as const;

export const DEFAULT_SETTINGS = {
  id: 'default',
  brandName: 'BMPT Solutions',
  tagline: 'Enabling potentials',
  logoUrl: '/images/bmpt-logo.png',
  phone: '+233 20 587 6724',
  phoneAlt: '',
  email: 'info@bmptsolutions.com',
  address: 'Building No. 49, 01, North Legon',
  aboutShort:
    'BMPT Solutions is a technology-driven business service firm that specializes in providing business growth solutions to businesses.',
  mapEmbedUrl: '',
  facebookUrl: '#',
  twitterUrl: '#',
  linkedinUrl: '#',
  instagramUrl: '#',
  footerNote: 'Designed by @bmptsolution',
};

// ── Collection getters (no params) ────────────────────────────

export const getSettings = cache(() =>
  cached(
    'cms:settings',
    async () => {
      const s = await prisma.siteSetting.findUnique({ where: { id: 'default' } });
      return s ?? DEFAULT_SETTINGS;
    },
    TTL.STABLE,
  ),
);

export const getHeroSlides = cache(() =>
  cached(
    'cms:hero',
    () => prisma.heroSlide.findMany({ where: { isActive: true }, orderBy: { order: 'asc' } }),
    TTL.STABLE,
  ),
);

export const getStats = cache(() =>
  cached(
    'cms:stats',
    () => prisma.stat.findMany({ where: { isActive: true }, orderBy: { order: 'asc' } }),
    TTL.STABLE,
  ),
);

export const getFeatures = cache(() =>
  cached(
    'cms:features',
    () => prisma.feature.findMany({ where: { isActive: true }, orderBy: { order: 'asc' } }),
    TTL.STABLE,
  ),
);

export const getServices = cache(() =>
  cached(
    'cms:services',
    () => prisma.service.findMany({ where: { isActive: true }, orderBy: { order: 'asc' } }),
    TTL.STABLE,
  ),
);

export const getAboutSections = cache(() =>
  cached(
    'cms:about',
    () =>
      prisma.aboutSection.findMany({
        where: { isActive: true },
        orderBy: { order: 'asc' },
      }),
    TTL.STABLE,
  ),
);

export const getVendors = cache(() =>
  cached(
    'cms:vendors',
    () => prisma.vendor.findMany({ where: { isActive: true }, orderBy: { order: 'asc' } }),
    TTL.STABLE,
  ),
);

export const getPublishedPosts = cache(() =>
  cached(
    'cms:posts',
    () =>
      prisma.blogPost.findMany({
        where: { isPublished: true },
        orderBy: { publishedAt: 'desc' },
        include: { author: { select: { name: true } } },
      }),
    TTL.MEDIUM,
  ),
);

export const getActiveBanner = cache(() =>
  cached(
    'cms:banner',
    () => prisma.banner.findFirst({ where: { isActive: true }, orderBy: { updatedAt: 'desc' } }),
    TTL.REACTIVE,
  ),
);

export const getActivePromotion = cache(() =>
  cached(
    'cms:promotion',
    async () => {
      const now = new Date();
      const promos = await prisma.promotion.findMany({
        where: { isActive: true },
        orderBy: { updatedAt: 'desc' },
      });
      return (
        promos.find(
          (p) =>
            (!p.startsAt || p.startsAt <= now) && (!p.endsAt || p.endsAt >= now),
        ) ?? null
      );
    },
    TTL.REACTIVE,
  ),
);

export type NavNode = {
  id: string;
  label: string;
  href: string;
  opensNewTab: boolean;
  children: NavNode[];
};

/**
 * Build the navigation tree (one level of sub-nav). Returns top-level
 * items with their active children attached. Fully CMS-managed — anything
 * the admin adds under /admin/nav appears here.
 */
export const getNavItems = cache(() =>
  cached(
    'cms:nav',
    async (): Promise<NavNode[]> => {
      const rows = await prisma.navItem.findMany({
        where: { isActive: true },
        orderBy: { order: 'asc' },
      });
      return rows
        .filter((r) => !r.parentId)
        .map<NavNode>((r) => ({
          id: r.id,
          label: r.label,
          href: r.href,
          opensNewTab: r.opensNewTab,
          children: rows
            .filter((c) => c.parentId === r.id)
            .map((c) => ({
              id: c.id,
              label: c.label,
              href: c.href,
              opensNewTab: c.opensNewTab,
              children: [],
            })),
        }));
    },
    TTL.STABLE,
  ),
);

// ── Per-slug getters (parameterised cache keys) ───────────────

export const getServiceBySlug = cache((slug: string) =>
  cached(
    `cms:service:${slug}`,
    () => prisma.service.findUnique({ where: { slug } }),
    TTL.STABLE,
  ),
);

export const getPostBySlug = cache((slug: string) =>
  cached(
    `cms:post:${slug}`,
    () =>
      prisma.blogPost.findFirst({
        where: { slug, isPublished: true },
        include: { author: { select: { name: true } } },
      }),
    TTL.MEDIUM,
  ),
);

/**
 * Fetch a published custom page (managed under /admin/pages) plus its
 * active sections in order. Returns null if not found / unpublished.
 */
export const getPublishedPageBySlug = cache((slug: string) =>
  cached(
    `cms:page:${slug}`,
    () =>
      prisma.page.findFirst({
        where: { slug, isPublished: true },
        include: {
          sections: {
            where: { isActive: true },
            orderBy: { order: 'asc' },
          },
        },
      }),
    TTL.MEDIUM,
  ),
);

export const getAllPublishedPageSlugs = cache(() =>
  prisma.page.findMany({
    where: { isPublished: true },
    select: { slug: true, updatedAt: true },
  }),
);

export const getSeo = cache((page: string) =>
  cached(
    `cms:seo:${page}`,
    () => prisma.seoMeta.findUnique({ where: { page } }),
    TTL.STABLE,
  ),
);
