'use client';

import { useEffect, useRef, useState } from 'react';
import { UploadCloud, Loader2, X, FolderOpen, Search } from 'lucide-react';

type LibraryItem = {
  id: string;
  url: string;
  key: string;
  filename: string;
  alt: string;
};

/**
 * Image picker with three ways to set an image:
 *   1. Paste a URL or `/images/...` path
 *   2. Upload to S3 (presigned PUT) — descriptive key `<purpose>/<slug>-<ts>.<ext>`
 *   3. Browse the media library and pick a previously uploaded image
 */
export default function ImageField({
  value,
  onChange,
  purpose,
}: {
  value: string;
  onChange: (url: string) => void;
  purpose: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [browserOpen, setBrowserOpen] = useState(false);

  async function handleFile(file: File) {
    setUploading(true);
    setError('');
    try {
      const presign = await fetch('/api/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          purpose,
          filename: file.name,
          contentType: file.type,
          size: file.size,
        }),
      });
      const data = await presign.json();
      if (!presign.ok) throw new Error(data.error || 'Upload failed');

      const put = await fetch(data.uploadUrl, {
        method: 'PUT',
        headers: { 'Content-Type': file.type },
        body: file,
      });
      if (!put.ok) throw new Error('S3 rejected the upload');
      onChange(data.url);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="/images/example.jpg or https://…"
          className="min-w-0 flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
        />
        <button
          type="button"
          onClick={() => setBrowserOpen(true)}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-navy hover:border-brand-400 hover:text-brand-600"
        >
          <FolderOpen size={16} /> Browse
        </button>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-navy hover:border-brand-400 hover:text-brand-600 disabled:opacity-50"
        >
          {uploading ? <Loader2 size={16} className="animate-spin" /> : <UploadCloud size={16} />}
          Upload
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
        />
      </div>
      {error && <p className="text-xs text-red-500">{error}</p>}
      {value && (
        <div className="relative inline-block">
          <div className="relative h-24 w-40 overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={value} alt="preview" className="h-full w-full object-cover" />
          </div>
          <button
            type="button"
            onClick={() => onChange('')}
            className="absolute -right-2 -top-2 rounded-full bg-white p-1 text-slate-500 shadow hover:text-red-500"
            aria-label="Clear image"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {browserOpen && (
        <MediaBrowser
          defaultPurpose={purpose}
          onPick={(url) => {
            onChange(url);
            setBrowserOpen(false);
          }}
          onClose={() => setBrowserOpen(false)}
        />
      )}
    </div>
  );
}

function MediaBrowser({
  defaultPurpose,
  onPick,
  onClose,
}: {
  defaultPurpose: string;
  onPick: (url: string) => void;
  onClose: () => void;
}) {
  const [items, setItems] = useState<LibraryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [filterPurpose, setFilterPurpose] = useState(defaultPurpose || '');

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    const url = filterPurpose ? `/api/media?purpose=${encodeURIComponent(filterPurpose)}` : '/api/media';
    fetch(url)
      .then((r) => r.json())
      .then((data) => {
        if (cancelled) return;
        setItems(Array.isArray(data.items) ? data.items : []);
      })
      .catch(() => setItems([]))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [filterPurpose]);

  const filtered = query
    ? items.filter(
        (i) =>
          i.filename.toLowerCase().includes(query.toLowerCase()) ||
          i.key.toLowerCase().includes(query.toLowerCase()) ||
          (i.alt || '').toLowerCase().includes(query.toLowerCase()),
      )
    : items;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-navy/50 p-4" onClick={onClose}>
      <div
        className="thin-scroll flex max-h-[85vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <div>
            <h2 className="font-display text-lg font-bold text-navy">Media Library</h2>
            <p className="text-xs text-slate-500">Pick a previously uploaded image to reuse it.</p>
          </div>
          <button onClick={onClose} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100" aria-label="Close">
            <X size={18} />
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-3 border-b border-slate-100 px-6 py-3">
          <div className="relative min-w-[200px] flex-1">
            <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search filename or description"
              className="w-full rounded-lg border border-slate-200 py-2 pl-9 pr-3 text-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
            />
          </div>
          <label className="flex items-center gap-2 text-xs text-slate-500">
            <input
              type="checkbox"
              checked={!!filterPurpose}
              onChange={(e) => setFilterPurpose(e.target.checked ? defaultPurpose : '')}
              className="h-4 w-4 rounded border-slate-300 text-brand-500 focus:ring-brand-400"
            />
            Only "{defaultPurpose}"
          </label>
        </div>

        <div className="thin-scroll flex-1 overflow-y-auto px-6 py-4">
          {loading ? (
            <div className="flex h-40 items-center justify-center text-slate-400">
              <Loader2 className="animate-spin" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex h-40 flex-col items-center justify-center text-center text-sm text-slate-400">
              <p>No images in the library yet.</p>
              <p className="mt-1 text-xs">Upload one with the Upload button — it will appear here next time.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {filtered.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => onPick(m.url)}
                  className="group overflow-hidden rounded-xl border border-slate-200 bg-white text-left transition hover:-translate-y-0.5 hover:border-brand-400 hover:shadow-lg"
                >
                  <div className="relative aspect-square bg-slate-50">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={m.url} alt={m.alt || m.filename} className="h-full w-full object-cover" />
                  </div>
                  <div className="space-y-0.5 p-2">
                    <p className="truncate text-xs font-medium text-navy">{m.filename}</p>
                    <p className="truncate text-[10px] text-slate-400">{m.alt || m.key.split('/')[0]}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
