'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Mail, Trash2, CheckCircle, Circle } from 'lucide-react';
import { setMessageRead, deleteMessage } from '@/app/admin/actions';

type Msg = {
  id: string;
  name: string;
  email: string;
  subject: string;
  service: string;
  message: string;
  isRead: boolean;
  createdAt: string;
};

export default function MessagesList({ rows }: { rows: Msg[] }) {
  const router = useRouter();
  const [open, setOpen] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function toggle(id: string) {
    setOpen(open === id ? null : id);
    const m = rows.find((r) => r.id === id);
    if (m && !m.isRead) {
      startTransition(async () => {
        await setMessageRead(id, true);
        router.refresh();
      });
    }
  }

  function remove(id: string) {
    if (!confirm('Delete this message?')) return;
    startTransition(async () => {
      await deleteMessage(id);
      router.refresh();
    });
  }

  if (rows.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-slate-400">
        <Mail size={28} className="mx-auto" />
        <p className="mt-3 text-sm">No messages yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {rows.map((m) => (
        <div key={m.id} className={`overflow-hidden rounded-xl border ${m.isRead ? 'border-slate-200 bg-white' : 'border-brand-200 bg-brand-50/30'}`}>
          <button
            onClick={() => toggle(m.id)}
            className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
          >
            <div className="flex min-w-0 items-center gap-3">
              {m.isRead ? <CheckCircle size={18} className="text-slate-300" /> : <Circle size={18} className="text-brand-500" />}
              <div className="min-w-0">
                <p className="truncate font-display text-sm font-semibold text-navy">{m.name} <span className="font-normal text-slate-500">— {m.email}</span></p>
                <p className="truncate text-xs text-slate-500">
                  {m.subject || m.service || m.message.slice(0, 80)}
                </p>
              </div>
            </div>
            <span className="shrink-0 text-xs text-slate-400">
              {new Date(m.createdAt).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' })}
            </span>
          </button>
          {open === m.id && (
            <div className="border-t border-slate-100 px-5 py-4">
              <dl className="grid gap-2 text-sm sm:grid-cols-2">
                <div><dt className="text-xs text-slate-400">Subject</dt><dd>{m.subject || '—'}</dd></div>
                <div><dt className="text-xs text-slate-400">Service</dt><dd>{m.service || '—'}</dd></div>
              </dl>
              <p className="mt-4 whitespace-pre-wrap text-sm text-slate-700">{m.message}</p>
              <div className="mt-5 flex justify-end gap-2">
                <a
                  href={`mailto:${m.email}?subject=Re: ${encodeURIComponent(m.subject || 'Your enquiry')}`}
                  className="btn-ghost !py-2"
                >
                  <Mail size={14} /> Reply
                </a>
                <button onClick={() => remove(m.id)} disabled={pending} className="btn-ghost !py-2 !border-red-200 !text-red-600 hover:!text-red-700">
                  <Trash2 size={14} /> Delete
                </button>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
