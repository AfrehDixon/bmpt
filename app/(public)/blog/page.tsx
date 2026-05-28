import Link from 'next/link';
import Image from 'next/image';
import { CalendarDays, ArrowRight } from 'lucide-react';
import { getPublishedPosts } from '@/lib/cms';
import { buildMetadata } from '@/lib/seo';
import Reveal from '@/components/Reveal';
import PageHeader from '@/components/public/PageHeader';

export const revalidate = 60;

export async function generateMetadata() {
  return buildMetadata('blog', {
    title: 'Blog',
    description: 'News, insights and articles from BMPT Solutions.',
    path: '/blog',
  });
}

function fmt(d: Date | null) {
  if (!d) return '';
  return new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

export default async function BlogPage() {
  const posts = await getPublishedPosts();

  return (
    <>
      <PageHeader title="Blog" crumb="Blog" />
      <div className="container-bmpt py-24">
        {posts.length === 0 ? (
          <p className="text-center text-slate-500">No posts published yet. Check back soon.</p>
        ) : (
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((p, i) => (
              <Reveal key={p.id} delay={i * 0.08}>
                <Link href={`/blog/${p.slug}`} className="group block h-full overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm transition hover:shadow-xl">
                  <div className="relative aspect-[16/10] overflow-hidden bg-slate-100">
                    {p.coverImage && (
                      <Image
                        src={p.coverImage}
                        alt={p.title}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    )}
                    <span className="absolute left-4 top-4 rounded-full bg-brand-500 px-3 py-1 text-xs font-semibold text-white">
                      {p.category}
                    </span>
                  </div>
                  <div className="p-6">
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      <CalendarDays size={14} />
                      {fmt(p.publishedAt)}
                      {p.author?.name && <span>· {p.author.name}</span>}
                    </div>
                    <h3 className="mt-3 font-display text-lg font-bold text-navy line-clamp-2">{p.title}</h3>
                    <p className="mt-2 text-sm text-slate-600 line-clamp-3">{p.excerpt}</p>
                    <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-brand-600">
                      Read more <ArrowRight size={15} className="transition-transform group-hover:translate-x-1" />
                    </span>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
