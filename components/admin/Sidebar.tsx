'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import {
  LayoutDashboard,
  Settings,
  Images,
  Sparkles,
  Layers,
  Wrench,
  Info,
  Users,
  Newspaper,
  Megaphone,
  Gift,
  Inbox,
  Search,
  LogOut,
  Image as ImageIcon,
  ExternalLink,
  Menu as MenuIcon,
  UserCog,
  FileText,
} from 'lucide-react';

const groups = [
  {
    label: 'Overview',
    items: [
      { href: '/admin', label: 'Dashboard', Icon: LayoutDashboard, exact: true },
      { href: '/admin/messages', label: 'Messages', Icon: Inbox },
    ],
  },
  {
    label: 'Content',
    items: [
      { href: '/admin/settings', label: 'Site Settings', Icon: Settings },
      { href: '/admin/nav', label: 'Navigation Menu', Icon: MenuIcon },
      { href: '/admin/pages', label: 'Custom Pages', Icon: FileText },
      { href: '/admin/hero', label: 'Hero Slides', Icon: Images },
      { href: '/admin/stats', label: 'Stats / Facts', Icon: Sparkles },
      { href: '/admin/features', label: 'Why Choose Us', Icon: Layers },
      { href: '/admin/services', label: 'Services', Icon: Wrench },
      { href: '/admin/about', label: 'About Sections', Icon: Info },
      { href: '/admin/vendors', label: 'Partners', Icon: Users },
      { href: '/admin/blog', label: 'Blog Posts', Icon: Newspaper },
    ],
  },
  {
    label: 'Marketing',
    items: [
      { href: '/admin/banners', label: 'Info Banners', Icon: Megaphone },
      { href: '/admin/promotions', label: 'Promotions', Icon: Gift },
    ],
  },
  {
    label: 'System',
    items: [
      { href: '/admin/seo', label: 'SEO & Sitemap', Icon: Search },
      { href: '/admin/media', label: 'Media Library', Icon: ImageIcon },
      { href: '/admin/users', label: 'Admin Users', Icon: UserCog },
    ],
  },
];

export default function Sidebar({ userName }: { userName: string }) {
  const pathname = usePathname();
  return (
    <aside className="thin-scroll fixed inset-y-0 left-0 z-30 hidden w-64 overflow-y-auto bg-navy text-slate-200 lg:block">
      <div className="px-6 py-6">
        <Link href="/admin" className="font-display text-lg font-bold text-white">
          BMPT <span className="text-brand-400">CMS</span>
        </Link>
      </div>
      <nav className="space-y-6 px-3 pb-8">
        {groups.map((g) => (
          <div key={g.label}>
            <p className="px-3 pb-2 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">
              {g.label}
            </p>
            <ul className="space-y-0.5">
              {g.items.map((item) => {
                const active = item.exact
                  ? pathname === item.href
                  : pathname.startsWith(item.href);
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
                        active
                          ? 'bg-brand-500 text-white'
                          : 'text-slate-300 hover:bg-white/5 hover:text-white'
                      }`}
                    >
                      <item.Icon size={17} />
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}

        <div className="space-y-1 border-t border-white/10 pt-4">
          <Link
            href="/"
            target="_blank"
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-slate-300 hover:bg-white/5 hover:text-white"
          >
            <ExternalLink size={17} /> View website
          </Link>
          <button
            onClick={() => signOut({ callbackUrl: '/admin/login' })}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-slate-300 hover:bg-white/5 hover:text-white"
          >
            <LogOut size={17} /> Sign out ({userName})
          </button>
        </div>
      </nav>
    </aside>
  );
}
