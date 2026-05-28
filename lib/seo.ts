import type { Metadata } from 'next';
import { getSeo } from './cms';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://bmptsolutions.com';
const SITE_NAME = process.env.NEXT_PUBLIC_SITE_NAME || 'BMPT Solutions';

/**
 * Build Next.js Metadata for a page from the CMS-managed SeoMeta row,
 * falling back to sensible defaults. Used by every public route so SEO
 * tags are editable from the admin "SEO" tab — not hardcoded.
 */
export async function buildMetadata(
  page: string,
  fallback: { title: string; description: string; path: string },
): Promise<Metadata> {
  const seo = await getSeo(page).catch(() => null);

  const title = seo?.title || fallback.title;
  const description = seo?.description || fallback.description;
  const url = `${APP_URL.replace(/\/$/, '')}${fallback.path}`;
  const ogImage = seo?.ogImage || `${APP_URL}/images/hero-business-formalization.jpg`;
  const keywords = seo?.keywords
    ? seo.keywords.split(',').map((k) => k.trim()).filter(Boolean)
    : undefined;

  return {
    title,
    description,
    keywords,
    metadataBase: new URL(APP_URL),
    alternates: { canonical: url },
    robots: seo?.noIndex ? { index: false, follow: false } : { index: true, follow: true },
    openGraph: {
      title,
      description,
      url,
      siteName: SITE_NAME,
      images: [{ url: ogImage }],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImage],
    },
  };
}
