'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, X, Loader2 } from 'lucide-react';
import { saveRecord } from '@/app/admin/actions';

const RESERVED = ['about', 'services', 'contact', 'blog', 'admin', 'api'];

function slugify(s: string) {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

export default function PagesNewButton() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [error, setError] = useState('');
  const [pending, startTransition] = useTransition();

  function submit() {
    setError('');
    const finalSlug = (slug || slugify(title)).trim();
    if (!title.trim()) return setError('Title is required');
    if (!finalSlug) return setError('Slug is required');
    if (RESERVED.includes(finalSlug))
      return setError(`"${finalSlug}" is a reserved route. Pick a different slug.`);

    startTransition(async () => {
      const res = await saveRecord('Page' as never, null, {
        title: title.trim(),
        slug: finalSlug,
        heroTitle: title.trim(),
        heroSubtitle: '',
        showHeader: true,
        isPublished: false,
        seoTitle: '',
        seoDescription: '',
      });
      if (res?.error) return setError(res.error);
      setOpen(false);
      router.refresh();
    });
  }

  return (
    <>
      <button onClick={() => setOpen(true)} className="btn-primary !py-2.5">
        <Plus size={16} /> New Page
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy/30 p-4" onClick={() => setOpen(false)}>
          <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
              <h2 className="font-display text-lg font-bold text-navy">New page</h2>
              <button onClick={() => setOpen(false)} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100">
                <X size={18} />
              </button>
            </div>
            <div className="space-y-4 px-6 py-5">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-navy">Title</label>
                <input
                  value={title}
                  onChange={(e) => {
                    setTitle(e.target.value);
                    if (!slug) setSlug(slugify(e.target.value));
                  }}
                  placeholder="Products"
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-navy">URL slug</label>
                <div className="flex items-center gap-2 rounded-lg border border-slate-200 pl-3 focus-within:border-brand-400 focus-within:ring-2 focus-within:ring-brand-100">
                  <span className="text-sm text-slate-400">/</span>
                  <input
                    value={slug}
                    onChange={(e) => setSlug(slugify(e.target.value))}
                    placeholder="products"
                    className="flex-1 border-0 px-0 py-2 text-sm focus:outline-none focus:ring-0"
                  />
                </div>
                <p className="mt-1 text-xs text-slate-400">
                  This is the public URL. Reserved: {RESERVED.map((r) => `/${r}`).join(', ')}.
                </p>
              </div>
              {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}
            </div>
            <div className="flex justify-end gap-3 border-t border-slate-100 px-6 py-4">
              <button onClick={() => setOpen(false)} className="btn-ghost !py-2.5">Cancel</button>
              <button onClick={submit} disabled={pending} className="btn-primary !py-2.5">
                {pending && <Loader2 size={16} className="animate-spin" />}
                Create page
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
