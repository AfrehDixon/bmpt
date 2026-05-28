import { prisma } from './prisma';
import { cached } from './redis';

/**
 * Read-through CMS data access for the public site. Each getter is
 * cached in Redis (cms:* namespace) and invalidated on admin writes.
 * Everything the public pages render comes through here — no static
 * content lives in the components.
 */

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

export async function getSettings() {
  return cached(
    'cms:settings',
    async () => {
      const s = await prisma.siteSetting.findUnique({ where: { id: 'default' } });
      return s ?? DEFAULT_SETTINGS;
    },
    120,
  );
}

export async function getHeroSlides() {
  return cached('cms:hero', () =>
    prisma.heroSlide.findMany({
      where: { isActive: true },
      orderBy: { order: 'asc' },
    }),
  );
}

export async function getStats() {
  return cached('cms:stats', () =>
    prisma.stat.findMany({ where: { isActive: true }, orderBy: { order: 'asc' } }),
  );
}

export async function getFeatures() {
  return cached('cms:features', () =>
    prisma.feature.findMany({ where: { isActive: true }, orderBy: { order: 'asc' } }),
  );
}

export async function getServices() {
  return cached('cms:services', () =>
    prisma.service.findMany({ where: { isActive: true }, orderBy: { order: 'asc' } }),
  );
}

export async function getServiceBySlug(slug: string) {
  return prisma.service.findUnique({ where: { slug } });
}

export async function getAboutSections() {
  return cached('cms:about', () =>
    prisma.aboutSection.findMany({
      where: { isActive: true },
      orderBy: { order: 'asc' },
    }),
  );
}

export async function getVendors() {
  return cached('cms:vendors', () =>
    prisma.vendor.findMany({ where: { isActive: true }, orderBy: { order: 'asc' } }),
  );
}

export async function getPublishedPosts() {
  return cached('cms:posts', () =>
    prisma.blogPost.findMany({
      where: { isPublished: true },
      orderBy: { publishedAt: 'desc' },
      include: { author: { select: { name: true } } },
    }),
  );
}

export async function getPostBySlug(slug: string) {
  return prisma.blogPost.findFirst({
    where: { slug, isPublished: true },
    include: { author: { select: { name: true } } },
  });
}

export async function getActiveBanner() {
  return cached(
    'cms:banner',
    () => prisma.banner.findFirst({ where: { isActive: true }, orderBy: { updatedAt: 'desc' } }),
    30,
  );
}

export async function getActivePromotion() {
  return cached(
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
    30,
  );
}

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
export async function getNavItems(): Promise<NavNode[]> {
  return cached('cms:nav', async () => {
    const rows = await prisma.navItem.findMany({
      where: { isActive: true },
      orderBy: { order: 'asc' },
    });
    const top = rows
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
    return top;
  });
}

/**
 * Fetch a published custom page (managed under /admin/pages) plus its
 * active sections in order. Returns null if not found / unpublished.
 */
export async function getPublishedPageBySlug(slug: string) {
  return prisma.page.findFirst({
    where: { slug, isPublished: true },
    include: {
      sections: {
        where: { isActive: true },
        orderBy: { order: 'asc' },
      },
    },
  });
}

export async function getAllPublishedPageSlugs() {
  return prisma.page.findMany({
    where: { isPublished: true },
    select: { slug: true, updatedAt: true },
  });
}

export async function getSeo(page: string) {
  return cached(`cms:seo:${page}`, () =>
    prisma.seoMeta.findUnique({ where: { page } }),
  );
}
