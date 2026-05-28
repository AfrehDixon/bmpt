import Link from 'next/link';
import {
  Images,
  Wrench,
  Newspaper,
  Inbox,
  Megaphone,
  Gift,
  Users,
  Layers,
} from 'lucide-react';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

async function counts() {
  const [services, posts, vendors, features, banners, promos, slides, messagesUnread] =
    await Promise.all([
      prisma.service.count(),
      prisma.blogPost.count(),
      prisma.vendor.count(),
      prisma.feature.count(),
      prisma.banner.count({ where: { isActive: true } }),
      prisma.promotion.count({ where: { isActive: true } }),
      prisma.heroSlide.count(),
      prisma.contactMessage.count({ where: { isRead: false } }),
    ]);
  return { services, posts, vendors, features, banners, promos, slides, messagesUnread };
}

export default async function DashboardPage() {
  const c = await counts();

  const tiles = [
    { href: '/admin/messages', label: 'Unread messages', value: c.messagesUnread, Icon: Inbox, accent: 'bg-amber-500' },
    { href: '/admin/hero', label: 'Hero slides', value: c.slides, Icon: Images, accent: 'bg-brand-500' },
    { href: '/admin/services', label: 'Services', value: c.services, Icon: Wrench, accent: 'bg-navy' },
    { href: '/admin/features', label: 'Features', value: c.features, Icon: Layers, accent: 'bg-emerald-500' },
    { href: '/admin/blog', label: 'Blog posts', value: c.posts, Icon: Newspaper, accent: 'bg-purple-500' },
    { href: '/admin/vendors', label: 'Partners', value: c.vendors, Icon: Users, accent: 'bg-pink-500' },
    { href: '/admin/banners', label: 'Active banners', value: c.banners, Icon: Megaphone, accent: 'bg-orange-500' },
    { href: '/admin/promotions', label: 'Active promotions', value: c.promos, Icon: Gift, accent: 'bg-rose-500' },
  ];

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-navy">Dashboard</h1>
      <p className="mt-1 text-sm text-slate-500">Manage every part of the BMPT Solutions website.</p>

      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {tiles.map((t) => (
          <Link
            key={t.href}
            href={t.href}
            className="group rounded-2xl border border-slate-100 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg"
          >
            <div className={`flex h-10 w-10 items-center justify-center rounded-lg text-white ${t.accent}`}>
              <t.Icon size={18} />
            </div>
            <p className="mt-4 font-display text-2xl font-bold text-navy">{t.value}</p>
            <p className="text-xs text-slate-500">{t.label}</p>
          </Link>
        ))}
      </div>

      <div className="mt-10 grid gap-5 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-100 bg-white p-6">
          <h2 className="font-display text-base font-semibold text-navy">Quick actions</h2>
          <ul className="mt-3 space-y-2 text-sm text-slate-600">
            <li>• Add a new <Link className="text-brand-600 hover:underline" href="/admin/services">service</Link></li>
            <li>• Publish a <Link className="text-brand-600 hover:underline" href="/admin/blog">blog post</Link></li>
            <li>• Show an <Link className="text-brand-600 hover:underline" href="/admin/banners">info banner</Link></li>
            <li>• Launch a <Link className="text-brand-600 hover:underline" href="/admin/promotions">promotion modal</Link></li>
            <li>• Update <Link className="text-brand-600 hover:underline" href="/admin/seo">SEO metadata</Link></li>
          </ul>
        </div>
        <div className="rounded-2xl border border-slate-100 bg-white p-6">
          <h2 className="font-display text-base font-semibold text-navy">How content reaches the site</h2>
          <p className="mt-2 text-sm text-slate-600">
            Every public page reads from this CMS and is cached in Redis for
            60 seconds. Saves here flush the cache automatically, so updates
            appear within seconds of publishing.
          </p>
        </div>
      </div>
    </div>
  );
}
