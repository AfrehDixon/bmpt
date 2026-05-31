import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { ArrowRight } from 'lucide-react';
import { getPublishedPageBySlug } from '@/lib/cms';
import Reveal from '@/components/Reveal';
import PageHeader from '@/components/public/PageHeader';

// Slugs reserved by other static routes. The catch-all only renders
// custom pages — never shadows /about, /services, /contact, /blog, /admin, /api.
const RESERVED = new Set([
  'about',
  'services',
  'contact',
  'blog',
  'admin',
  'api',
  'sitemap.xml',
  'robots.txt',
  '_next',
  'images',
]);

// ISR — cached per-slug HTML for 5 min. Admin writes call
// revalidatePath('/', 'layout') which invalidates this too, so a freshly
// edited custom page goes live on the next request.
export const revalidate = 6000;

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  if (RESERVED.has(params.slug)) return {};
  const page = await getPublishedPageBySlug(params.slug);
  if (!page) return { title: 'Page not found' };
  return {
    title: page.seoTitle || page.title,
    description: page.seoDescription || '',
    openGraph: {
      title: page.seoTitle || page.title,
      description: page.seoDescription || '',
      images: page.ogImage ? [{ url: page.ogImage }] : undefined,
      type: 'website',
    },
  };
}

const bgClass = {
  WHITE: 'bg-white',
  LIGHT: 'bg-slate-50',
  NAVY: 'bg-navy text-white',
  BRAND: 'bg-brand-500 text-white',
};

export default async function DynamicPage({ params }: { params: { slug: string } }) {
  if (RESERVED.has(params.slug)) notFound();
  const page = await getPublishedPageBySlug(params.slug);
  if (!page) notFound();

  return (
    <>
      {page.showHeader && (
        <PageHeader
          title={page.heroTitle || page.title}
          crumb={page.title}
        />
      )}

      {page.heroSubtitle && (
        <div className="container-bmpt -mt-10 max-w-3xl text-center">
          <p className="rounded-2xl bg-white px-6 py-4 text-sm text-slate-600 shadow-lg ring-1 ring-slate-100">
            {page.heroSubtitle}
          </p>
        </div>
      )}

      {page.sections.length === 0 && (
        <div className="container-bmpt py-24 text-center text-slate-400">
          <p>This page doesn&apos;t have any content yet.</p>
        </div>
      )}

      {page.sections.map((s) => {
        const isDark = s.background === 'NAVY' || s.background === 'BRAND';
        const wrapper = `${bgClass[s.background]} py-20`;

        if (s.layout === 'TEXT_ONLY') {
          return (
            <section key={s.id} className={wrapper}>
              <div className="container-bmpt max-w-3xl text-center">
                <Reveal>
                  {s.eyebrow && <p className={`eyebrow ${isDark ? '!text-brand-300' : ''}`}>{s.eyebrow}</p>}
                  {s.heading && (
                    <h2 className={`mt-3 font-display text-3xl font-bold sm:text-4xl ${isDark ? 'text-white' : 'text-navy'}`}>
                      {s.heading}
                    </h2>
                  )}
                  {s.body && (
                    <div
                      className={`prose-bmpt mt-5 ${isDark ? 'prose-invert' : ''}`}
                      dangerouslySetInnerHTML={{ __html: s.body }}
                    />
                  )}
                  {s.ctaText && s.ctaLink && (
                    <Link href={s.ctaLink} className="btn-primary mt-7">
                      {s.ctaText} <ArrowRight size={16} />
                    </Link>
                  )}
                </Reveal>
              </div>
            </section>
          );
        }

        if (s.layout === 'IMAGE_FULL' && s.imageUrl) {
          return (
            <section key={s.id} className="relative h-[60vh] min-h-[400px] overflow-hidden">
              <Image src={s.imageUrl} alt={s.imageAlt || s.heading} fill className="object-cover" />
              {(s.heading || s.body) && (
                <div className="absolute inset-0 flex items-center justify-center bg-navy/60 text-center">
                  <Reveal>
                    <div className="container-bmpt max-w-3xl px-6 text-white">
                      {s.eyebrow && <p className="eyebrow !text-brand-300">{s.eyebrow}</p>}
                      {s.heading && (
                        <h2 className="mt-3 font-display text-4xl font-bold sm:text-5xl">{s.heading}</h2>
                      )}
                      {s.body && (
                        <div className="prose-bmpt prose-invert mx-auto mt-5" dangerouslySetInnerHTML={{ __html: s.body }} />
                      )}
                      {s.ctaText && s.ctaLink && (
                        <Link href={s.ctaLink} className="btn-primary mt-7">
                          {s.ctaText}
                        </Link>
                      )}
                    </div>
                  </Reveal>
                </div>
              )}
            </section>
          );
        }

        if (s.layout === 'CARD') {
          return (
            <section key={s.id} className={wrapper}>
              <div className="container-bmpt max-w-4xl">
                <Reveal>
                  <div className="card-soft">
                    {s.eyebrow && <p className="eyebrow">{s.eyebrow}</p>}
                    {s.heading && (
                      <h3 className="mt-2 font-display text-2xl font-bold text-navy">{s.heading}</h3>
                    )}
                    {s.body && (
                      <div className="prose-bmpt mt-4" dangerouslySetInnerHTML={{ __html: s.body }} />
                    )}
                    {s.ctaText && s.ctaLink && (
                      <Link href={s.ctaLink} className="btn-primary mt-6">
                        {s.ctaText} <ArrowRight size={16} />
                      </Link>
                    )}
                  </div>
                </Reveal>
              </div>
            </section>
          );
        }

        // IMAGE_LEFT / IMAGE_RIGHT (default split layout)
        const imageRight = s.layout === 'IMAGE_RIGHT';
        return (
          <section key={s.id} className={wrapper}>
            <div className={`container-bmpt grid items-center gap-12 lg:grid-cols-2 ${imageRight ? '' : ''}`}>
              <Reveal className={imageRight ? 'lg:order-1' : 'lg:order-2'}>
                {s.imageUrl ? (
                  <div className="relative aspect-[4/3] overflow-hidden rounded-3xl shadow-xl">
                    <Image src={s.imageUrl} alt={s.imageAlt || s.heading} fill className="object-cover" />
                  </div>
                ) : (
                  <div className="aspect-[4/3] rounded-3xl bg-slate-100" />
                )}
              </Reveal>
              <Reveal delay={0.1} className={imageRight ? 'lg:order-2' : 'lg:order-1'}>
                {s.eyebrow && <p className={`eyebrow ${isDark ? '!text-brand-300' : ''}`}>{s.eyebrow}</p>}
                {s.heading && (
                  <h2 className={`mt-3 font-display text-3xl font-bold sm:text-4xl ${isDark ? 'text-white' : 'text-navy'}`}>
                    {s.heading}
                  </h2>
                )}
                {s.body && (
                  <div
                    className={`prose-bmpt mt-5 ${isDark ? 'prose-invert' : ''}`}
                    dangerouslySetInnerHTML={{ __html: s.body }}
                  />
                )}
                {s.ctaText && s.ctaLink && (
                  <Link href={s.ctaLink} className="btn-primary mt-7">
                    {s.ctaText} <ArrowRight size={16} />
                  </Link>
                )}
              </Reveal>
            </div>
          </section>
        );
      })}
    </>
  );
}
