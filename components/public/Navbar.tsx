'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Menu, X, ChevronDown } from 'lucide-react';
import type { NavNode } from '@/lib/cms';

function isActive(pathname: string, href: string): boolean {
  if (!href) return false;
  // Strip hash so /services#foo still highlights /services.
  const path = href.split('#')[0] || '/';
  if (path === '/') return pathname === '/';
  return pathname === path || pathname.startsWith(path + '/');
}

function linkProps(item: NavNode) {
  return item.opensNewTab ? { target: '_blank', rel: 'noreferrer' as const } : {};
}

export default function Navbar({
  brandName,
  tagline,
  logoUrl,
  navItems,
}: {
  brandName: string;
  tagline: string;
  logoUrl?: string | null;
  navItems: NavNode[];
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
    setExpanded(null);
  }, [pathname]);

  return (
    <header
      className={`sticky top-0 z-40 transition-all duration-300 ${
        scrolled ? 'bg-navy/95 shadow-lg backdrop-blur' : 'bg-navy'
      }`}
    >
      <nav className="container-bmpt flex items-center justify-between py-3">
        <Link href="/" className="flex items-center gap-3">
          {logoUrl ? (
            <Image
              src={logoUrl}
              alt={brandName}
              width={48}
              height={48}
              className="h-11 w-auto object-contain"
              priority
            />
          ) : (
            <span className="font-display text-xl font-bold text-white">{brandName}</span>
          )}
          <span className="hidden text-[11px] font-medium uppercase tracking-[0.25em] text-brand-300 sm:block">
            {tagline}
          </span>
        </Link>

        {/* Desktop */}
        <div className="hidden items-center gap-1 lg:flex">
          {navItems.map((item) => {
            const active = isActive(pathname, item.href);
            const hasChildren = item.children.length > 0;
            return (
              <div key={item.id} className="group relative">
                <Link
                  href={item.href}
                  {...linkProps(item)}
                  className={`flex items-center gap-1 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                    active ? 'text-brand-400' : 'text-slate-200 hover:text-white'
                  }`}
                >
                  {item.label}
                  {hasChildren && (
                    <ChevronDown size={14} className="transition-transform group-hover:rotate-180" />
                  )}
                </Link>
                {hasChildren && (
                  <div className="invisible absolute left-1/2 top-full z-50 -translate-x-1/2 pt-2 opacity-0 transition-all duration-150 group-hover:visible group-hover:opacity-100">
                    <ul className="min-w-[220px] overflow-hidden rounded-xl bg-white py-2 shadow-2xl ring-1 ring-black/5">
                      {item.children.map((c) => (
                        <li key={c.id}>
                          <Link
                            href={c.href}
                            {...linkProps(c)}
                            className="block px-4 py-2 text-sm text-navy transition-colors hover:bg-brand-50 hover:text-brand-600"
                          >
                            {c.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            );
          })}
          <Link href="/contact" className="btn-primary ml-2 !py-2.5">
            Get a Quote
          </Link>
        </div>

        <button
          className="rounded-lg p-2 text-white lg:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </nav>

      {/* Mobile */}
      {open && (
        <div className="border-t border-white/10 bg-navy lg:hidden">
          <div className="container-bmpt flex flex-col gap-1 py-4">
            {navItems.map((item) => {
              const active = isActive(pathname, item.href);
              const hasChildren = item.children.length > 0;
              const isExpanded = expanded === item.id;
              return (
                <div key={item.id}>
                  <div className="flex items-center">
                    <Link
                      href={item.href}
                      {...linkProps(item)}
                      className={`flex-1 rounded-lg px-4 py-3 text-sm font-medium ${
                        active ? 'bg-white/10 text-brand-400' : 'text-slate-200'
                      }`}
                    >
                      {item.label}
                    </Link>
                    {hasChildren && (
                      <button
                        aria-label={`Toggle ${item.label} sub-menu`}
                        onClick={() => setExpanded(isExpanded ? null : item.id)}
                        className="rounded-lg p-2 text-slate-300 hover:bg-white/10 hover:text-white"
                      >
                        <ChevronDown
                          size={18}
                          className={`transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                        />
                      </button>
                    )}
                  </div>
                  {hasChildren && isExpanded && (
                    <ul className="ml-4 mt-1 space-y-0.5 border-l border-white/10 pl-3">
                      {item.children.map((c) => (
                        <li key={c.id}>
                          <Link
                            href={c.href}
                            {...linkProps(c)}
                            className="block rounded-lg px-3 py-2 text-sm text-slate-300 hover:bg-white/5 hover:text-white"
                          >
                            {c.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              );
            })}
            <Link href="/contact" className="btn-primary mt-2 justify-center">
              Get a Quote
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
