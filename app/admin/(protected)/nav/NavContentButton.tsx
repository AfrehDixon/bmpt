'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Pencil, Plus, ExternalLink, Loader2 } from 'lucide-react';
import { createPageForNav } from '@/app/admin/actions';

/**
 * Per-row content shortcut shown in the /admin/nav table. Lets the admin
 * jump straight from a nav link to the editor that owns its content.
 */
export default function NavContentButton({
  navId,
  status,
  pageId,
}: {
  navId: string;
  status: 'edit' | 'create' | 'external' | 'builtin' | 'home' | 'invalid';
  pageId: string | null;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState('');

  if (status === 'edit' && pageId) {
    return (
      <Link
        href={`/admin/pages/${pageId}`}
        className="inline-flex items-center gap-1.5 rounded-lg border border-brand-200 bg-brand-50 px-3 py-1.5 text-xs font-semibold text-brand-700 hover:border-brand-400 hover:bg-brand-100"
      >
        <Pencil size={13} /> Edit content
      </Link>
    );
  }

  if (status === 'create') {
    function add() {
      setError('');
      startTransition(async () => {
        const res = await createPageForNav(navId);
        if (res?.error) setError(res.error);
        else if (res?.pageId) router.push(`/admin/pages/${res.pageId}`);
      });
    }
    return (
      <div className="flex flex-col items-start gap-1">
        <button
          onClick={add}
          disabled={pending}
          className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 hover:border-emerald-400 hover:bg-emerald-100 disabled:opacity-60"
        >
          {pending ? <Loader2 size={13} className="animate-spin" /> : <Plus size={13} />}
          Add content
        </button>
        {error && <p className="max-w-[220px] text-[11px] text-red-500">{error}</p>}
      </div>
    );
  }

  if (status === 'external') {
    return (
      <span className="inline-flex items-center gap-1 text-xs text-slate-400">
        <ExternalLink size={12} /> External
      </span>
    );
  }
  if (status === 'home') {
    return <span className="text-xs text-slate-400">Home page</span>;
  }
  if (status === 'builtin') {
    return <span className="text-xs text-slate-400">Built-in page</span>;
  }
  return <span className="text-xs text-slate-400">—</span>;
}
