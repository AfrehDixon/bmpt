import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { CalendarDays, ArrowLeft } from 'lucide-react';
import type { Metadata } from 'next';
import { getPostBySlug } from '@/lib/cms';

export const revalidate = 6000;

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const post = await getPostBySlug(params.slug);
  if (!post) return { title: 'Post not found' };
  return {
    title: post.title,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      images: post.coverImage ? [{ url: post.coverImage }] : undefined,
      type: 'article',
    },
  };
}

export default async function BlogPostPage({ params }: { params: { slug: string } }) {
  const post = await getPostBySlug(params.slug);
  if (!post) notFound();

  const date = post.publishedAt
    ? new Date(post.publishedAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })
    : '';

  return (
    <article className="pb-24">
      <div className="bg-navy py-16">
        <div className="container-bmpt max-w-3xl">
          <Link href="/blog" className="inline-flex items-center gap-1 text-sm text-brand-300 hover:text-white">
            <ArrowLeft size={16} /> Back to blog
          </Link>
          <span className="mt-4 block text-sm font-semibold text-brand-400">{post.category}</span>
          <h1 className="mt-2 font-display text-3xl font-bold text-white sm:text-4xl">{post.title}</h1>
          <div className="mt-4 flex items-center gap-2 text-sm text-slate-300">
            <CalendarDays size={15} /> {date}
            {post.author?.name && <span>· {post.author.name}</span>}
          </div>
        </div>
      </div>

      {post.coverImage && (
        <div className="container-bmpt -mt-10 max-w-3xl">
          <div className="relative aspect-[16/8] overflow-hidden rounded-2xl shadow-2xl">
            <Image src={post.coverImage} alt={post.title} fill className="object-cover" priority />
          </div>
        </div>
      )}

      <div
        className="prose-bmpt container-bmpt mt-12 max-w-3xl"
        dangerouslySetInnerHTML={{ __html: post.body }}
      />
    </article>
  );
}
