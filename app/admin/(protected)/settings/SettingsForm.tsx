'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Save, Loader2, CheckCircle2 } from 'lucide-react';
import ImageField from '@/components/admin/ImageField';
import { saveSettings } from '@/app/admin/actions';

const TEXT_FIELDS: { name: string; label: string; col?: 'full' | 'half'; type?: 'text' | 'textarea' }[] = [
  { name: 'brandName', label: 'Brand name', col: 'half' },
  { name: 'tagline', label: 'Tagline', col: 'half' },
  { name: 'phone', label: 'Phone (primary)', col: 'half' },
  { name: 'phoneAlt', label: 'Phone (alt)', col: 'half' },
  { name: 'email', label: 'Email', col: 'half' },
  { name: 'address', label: 'Address', col: 'half' },
  { name: 'aboutShort', label: 'Short about (footer)', col: 'full', type: 'textarea' },
  { name: 'mapEmbedUrl', label: 'Google Maps embed URL', col: 'full' },
  { name: 'facebookUrl', label: 'Facebook URL', col: 'half' },
  { name: 'twitterUrl', label: 'Twitter URL', col: 'half' },
  { name: 'linkedinUrl', label: 'LinkedIn URL', col: 'half' },
  { name: 'instagramUrl', label: 'Instagram URL', col: 'half' },
  { name: 'footerNote', label: 'Footer credit note', col: 'full' },
];

type Initial = Record<string, unknown> | null;

export default function SettingsForm({ initial }: { initial: Initial }) {
  const router = useRouter();
  const [form, setForm] = useState<Record<string, string>>(() => {
    const f: Record<string, string> = {};
    for (const tf of TEXT_FIELDS) f[tf.name] = String((initial?.[tf.name] as string) ?? '');
    f.logoUrl = String((initial?.logoUrl as string) ?? '');
    return f;
  });
  const [pending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaved(false);
    setError('');
    startTransition(async () => {
      const res = await saveSettings(form);
      if (res?.error) setError(res.error);
      else {
        setSaved(true);
        router.refresh();
        setTimeout(() => setSaved(false), 2500);
      }
    });
  }

  const inputCls =
    'w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100';

  return (
    <form onSubmit={submit} className="space-y-6">
      <div className="rounded-2xl border border-slate-100 bg-white p-6">
        <h2 className="font-display text-base font-semibold text-navy">Logo</h2>
        <p className="mt-1 text-xs text-slate-500">Recommended: transparent PNG, ~200px tall.</p>
        <div className="mt-4">
          <ImageField
            value={form.logoUrl}
            onChange={(url) => setForm((s) => ({ ...s, logoUrl: url }))}
            purpose="brand"
          />
        </div>
      </div>

      <div className="rounded-2xl border border-slate-100 bg-white p-6">
        <h2 className="font-display text-base font-semibold text-navy">Brand &amp; contact</h2>
        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          {TEXT_FIELDS.map((f) => (
            <div key={f.name} className={f.col === 'full' ? 'sm:col-span-2' : ''}>
              <label className="mb-1.5 block text-sm font-medium text-navy">{f.label}</label>
              {f.type === 'textarea' ? (
                <textarea
                  rows={3}
                  value={form[f.name] ?? ''}
                  onChange={(e) => setForm((s) => ({ ...s, [f.name]: e.target.value }))}
                  className={inputCls}
                />
              ) : (
                <input
                  type="text"
                  value={form[f.name] ?? ''}
                  onChange={(e) => setForm((s) => ({ ...s, [f.name]: e.target.value }))}
                  className={inputCls}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="sticky bottom-4 flex items-center justify-end gap-3">
        {saved && (
          <span className="flex items-center gap-1 rounded-full bg-emerald-100 px-3 py-1.5 text-xs font-medium text-emerald-700">
            <CheckCircle2 size={14} /> Saved
          </span>
        )}
        {error && (
          <span className="rounded-full bg-red-100 px-3 py-1.5 text-xs font-medium text-red-700">{error}</span>
        )}
        <button disabled={pending} type="submit" className="btn-primary !py-2.5">
          {pending ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
          Save changes
        </button>
      </div>
    </form>
  );
}
