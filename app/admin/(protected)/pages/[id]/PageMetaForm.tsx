'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Save, Loader2, CheckCircle2, Trash2 } from 'lucide-react';
import ImageField from '@/components/admin/ImageField';
import { saveRecord, deleteRecord } from '@/app/admin/actions';

type Page = {
  id: string;
  slug: string;
  title: string;
  heroTitle: string;
  heroSubtitle: string;
  heroImageUrl: string | null;
  showHeader: boolean;
  isPublished: boolean;
  seoTitle: string;
  seoDescription: string;
  ogImage: string | null;
};

const inputCls =
  'w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100';

export default function PageMetaForm({ initial }: { initial: Page }) {
  const router = useRouter();
  const [form, setForm] = useState({
    title: initial.title,
    slug: initial.slug,
    heroTitle: initial.heroTitle,
    heroSubtitle: initial.heroSubtitle,
    heroImageUrl: initial.heroImageUrl ?? '',
    showHeader: initial.showHeader,
    isPublished: initial.isPublished,
    seoTitle: initial.seoTitle,
    seoDescription: initial.seoDescription,
    ogImage: initial.ogImage ?? '',
  });
  const [pending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  function save() {
    setSaved(false);
    setError('');
    startTransition(async () => {
      const res = await saveRecord('Page' as never, initial.id, form);
      if (res?.error) setError(res.error);
      else {
        setSaved(true);
        router.refresh();
        setTimeout(() => setSaved(false), 2500);
      }
    });
  }

  function destroy() {
    if (!confirm(`Delete page "${initial.title}" and all of its sections? This cannot be undone.`)) return;
    startTransition(async () => {
      const res = await deleteRecord('Page' as never, initial.id);
      if (res?.error) setError(res.error);
      else router.push('/admin/pages');
    });
  }

  return (
    <div className="space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-navy">Title</label>
          <input className={inputCls} value={form.title} onChange={(e) => setForm((s) => ({ ...s, title: e.target.value }))} />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-navy">Slug (URL path)</label>
          <input className={inputCls} value={form.slug} onChange={(e) => setForm((s) => ({ ...s, slug: e.target.value.replace(/[^a-z0-9-]/g, '') }))} />
          <p className="mt-1 text-xs text-slate-400">Public URL: <span className="font-mono">/{form.slug || '…'}</span></p>
        </div>
        <div className="sm:col-span-2">
          <label className="mb-1.5 block text-sm font-medium text-navy">Hero heading (shown on the page header)</label>
          <input className={inputCls} value={form.heroTitle} onChange={(e) => setForm((s) => ({ ...s, heroTitle: e.target.value }))} placeholder="Defaults to Title" />
        </div>
        <div className="sm:col-span-2">
          <label className="mb-1.5 block text-sm font-medium text-navy">Hero subtitle (optional)</label>
          <textarea rows={2} className={inputCls} value={form.heroSubtitle} onChange={(e) => setForm((s) => ({ ...s, heroSubtitle: e.target.value }))} />
        </div>
        <label className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={form.showHeader}
            onChange={(e) => setForm((s) => ({ ...s, showHeader: e.target.checked }))}
            className="h-4 w-4 rounded border-slate-300 text-brand-500 focus:ring-brand-400"
          />
          <span className="text-sm font-medium text-navy">Show the dark page header</span>
        </label>
        <label className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={form.isPublished}
            onChange={(e) => setForm((s) => ({ ...s, isPublished: e.target.checked }))}
            className="h-4 w-4 rounded border-slate-300 text-brand-500 focus:ring-brand-400"
          />
          <span className="text-sm font-medium text-navy">Published (visible on the public site)</span>
        </label>
      </div>

      <details className="rounded-xl border border-slate-100 bg-slate-50/60 p-4">
        <summary className="cursor-pointer text-sm font-semibold text-navy">SEO &amp; Open Graph</summary>
        <div className="mt-4 space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-navy">SEO title</label>
            <input className={inputCls} value={form.seoTitle} onChange={(e) => setForm((s) => ({ ...s, seoTitle: e.target.value }))} placeholder="Defaults to Title" />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-navy">Meta description</label>
            <textarea rows={2} className={inputCls} value={form.seoDescription} onChange={(e) => setForm((s) => ({ ...s, seoDescription: e.target.value }))} />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-navy">Open Graph image</label>
            <ImageField value={form.ogImage} onChange={(url) => setForm((s) => ({ ...s, ogImage: url }))} purpose={`page-${form.slug}-og`} />
          </div>
        </div>
      </details>

      <div className="flex items-center justify-between border-t border-slate-100 pt-5">
        <button onClick={destroy} disabled={pending} className="btn-ghost !py-2.5 !border-red-200 !text-red-600 hover:!text-red-700">
          <Trash2 size={14} /> Delete page
        </button>
        <div className="flex items-center gap-3">
          {saved && (
            <span className="flex items-center gap-1 rounded-full bg-emerald-100 px-3 py-1.5 text-xs font-medium text-emerald-700">
              <CheckCircle2 size={14} /> Saved
            </span>
          )}
          {error && <span className="rounded-full bg-red-100 px-3 py-1.5 text-xs font-medium text-red-700">{error}</span>}
          <button onClick={save} disabled={pending} className="btn-primary !py-2.5">
            {pending ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            Save details
          </button>
        </div>
      </div>
    </div>
  );
}
