'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Pencil, Trash2, X, Loader2 } from 'lucide-react';
import type { FieldSpec, CrudRow } from './types';
import { saveRecord, deleteRecord } from '@/app/admin/actions';
import ImageField from './ImageField';

function emptyForm(fields: FieldSpec[]): Record<string, unknown> {
  const obj: Record<string, unknown> = {};
  for (const f of fields) {
    if (f.displayOnly) continue;
    obj[f.name] =
      f.default ??
      (f.type === 'boolean' ? false : f.type === 'number' ? 0 : '');
  }
  return obj;
}

function coerce(fields: FieldSpec[], form: Record<string, unknown>) {
  const out: Record<string, unknown> = {};
  for (const f of fields) {
    if (f.displayOnly) continue;
    const v = form[f.name];
    if (f.type === 'number') out[f.name] = Number(v) || 0;
    else if (f.type === 'boolean') out[f.name] = Boolean(v);
    else if (f.type === 'datetime') out[f.name] = v ? String(v) : null;
    else out[f.name] = v ?? '';
  }
  return out;
}

export default function CrudManager({
  model,
  title,
  singular,
  fields,
  rows,
  defaultData,
  hideTitle = false,
  extraColumn,
}: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  model: any;
  title: string;
  singular: string;
  fields: FieldSpec[];
  rows: CrudRow[];
  /** Extra key/value pairs merged into every submission (e.g. `{ pageId: '…' }`). */
  defaultData?: Record<string, unknown>;
  /** Skip the section header so the manager can be embedded inside another page. */
  hideTitle?: boolean;
  /**
   * Optional extra column shown to the left of the Actions column.
   * `cells` is a pre-rendered map of `{ [rowId]: <JSX> }` so the parent
   * (a server component) can render client-component cells without
   * crossing the server→client boundary with a function prop.
   */
  extraColumn?: { header: string; cells: Record<string, React.ReactNode> };
}) {
  const router = useRouter();
  const [editing, setEditing] = useState<CrudRow | null>(null);
  const [form, setForm] = useState<Record<string, unknown>>({});
  const [open, setOpen] = useState(false);
  const [error, setError] = useState('');
  const [pending, startTransition] = useTransition();

  const listFields = fields.filter((f) => !f.hideInList).slice(0, 3);

  function openNew() {
    setEditing(null);
    setForm(emptyForm(fields));
    setError('');
    setOpen(true);
  }

  function openEdit(row: CrudRow) {
    setEditing(row);
    const f: Record<string, unknown> = {};
    for (const spec of fields) {
      if (spec.displayOnly) continue;
      const v = row[spec.name];
      if (spec.type === 'datetime' && v) {
        f[spec.name] = new Date(v as string).toISOString().slice(0, 16);
      } else {
        f[spec.name] = v ?? (spec.type === 'boolean' ? false : '');
      }
    }
    setForm(f);
    setError('');
    setOpen(true);
  }

  function submit() {
    setError('');
    startTransition(async () => {
      const payload = { ...coerce(fields, form), ...(defaultData ?? {}) };
      const res = await saveRecord(model, editing?.id ?? null, payload);
      if (res?.error) setError(res.error);
      else {
        setOpen(false);
        router.refresh();
      }
    });
  }

  function remove(row: CrudRow) {
    if (!confirm(`Delete this ${singular.toLowerCase()}?`)) return;
    startTransition(async () => {
      await deleteRecord(model, row.id);
      router.refresh();
    });
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        {hideTitle ? (
          <h2 className="font-display text-lg font-semibold text-navy">
            {rows.length} {singular.toLowerCase()}{rows.length === 1 ? '' : 's'}
          </h2>
        ) : (
          <div>
            <h1 className="font-display text-2xl font-bold text-navy">{title}</h1>
            <p className="text-sm text-slate-500">{rows.length} item{rows.length === 1 ? '' : 's'}</p>
          </div>
        )}
        <button onClick={openNew} className="btn-primary !py-2.5">
          <Plus size={16} /> Add {singular}
        </button>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
            <tr>
              {listFields.map((f) => (
                <th key={f.name} className="px-4 py-3 font-semibold">{f.label}</th>
              ))}
              {extraColumn && <th className="px-4 py-3 font-semibold">{extraColumn.header}</th>}
              <th className="px-4 py-3 text-right font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.length === 0 && (
              <tr>
                <td colSpan={listFields.length + (extraColumn ? 2 : 1)} className="px-4 py-10 text-center text-slate-400">
                  No {title.toLowerCase()} yet. Click “Add {singular}”.
                </td>
              </tr>
            )}
            {rows.map((row) => (
              <tr key={row.id} className="hover:bg-slate-50/60">
                {listFields.map((f) => (
                  <td key={f.name} className="max-w-xs px-4 py-3">
                    {f.type === 'image' && row[f.name] ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={String(row[f.name])} alt="" className="h-10 w-16 rounded object-cover" />
                    ) : f.type === 'boolean' ? (
                      <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${row[f.name] ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                        {row[f.name] ? 'Yes' : 'No'}
                      </span>
                    ) : (
                      <span className="line-clamp-1 text-slate-700">{String(row[f.name] ?? '')}</span>
                    )}
                  </td>
                ))}
                {extraColumn && <td className="px-4 py-3">{extraColumn.cells[row.id]}</td>}
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-1">
                    <button onClick={() => openEdit(row)} className="rounded-lg p-2 text-slate-500 hover:bg-brand-50 hover:text-brand-600">
                      <Pencil size={16} />
                    </button>
                    <button onClick={() => remove(row)} className="rounded-lg p-2 text-slate-500 hover:bg-red-50 hover:text-red-600">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Slide-over form */}
      {open && (
        <div className="fixed inset-0 z-50 flex justify-end bg-navy/30" onClick={() => setOpen(false)}>
          <div
            className="thin-scroll h-full w-full max-w-lg overflow-y-auto bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 flex items-center justify-between border-b border-slate-100 bg-white px-6 py-4">
              <h2 className="font-display text-lg font-bold text-navy">
                {editing ? `Edit ${singular}` : `New ${singular}`}
              </h2>
              <button onClick={() => setOpen(false)} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100">
                <X size={18} />
              </button>
            </div>

            <div className="space-y-5 px-6 py-6">
              {fields.filter((f) => !f.displayOnly).map((f) => (
                <div key={f.name}>
                  {f.type !== 'boolean' && (
                    <label className="mb-1.5 block text-sm font-medium text-navy">
                      {f.label}
                      {f.required && <span className="text-red-500"> *</span>}
                    </label>
                  )}

                  {f.type === 'image' ? (
                    <ImageField
                      value={String(form[f.name] ?? '')}
                      onChange={(url) => setForm((s) => ({ ...s, [f.name]: url }))}
                      purpose={f.uploadPurpose || singular.toLowerCase()}
                    />
                  ) : f.type === 'textarea' || f.type === 'html' ? (
                    <textarea
                      rows={f.type === 'html' ? 8 : 4}
                      value={String(form[f.name] ?? '')}
                      placeholder={f.placeholder}
                      onChange={(e) => setForm((s) => ({ ...s, [f.name]: e.target.value }))}
                      className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
                    />
                  ) : f.type === 'select' ? (
                    <select
                      value={String(form[f.name] ?? '')}
                      onChange={(e) => setForm((s) => ({ ...s, [f.name]: e.target.value }))}
                      className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
                    >
                      <option value="">— select —</option>
                      {f.options?.map((o) => (
                        <option key={o.value} value={o.value}>{o.label}</option>
                      ))}
                    </select>
                  ) : f.type === 'boolean' ? (
                    <label className="flex cursor-pointer items-center gap-3">
                      <input
                        type="checkbox"
                        checked={Boolean(form[f.name])}
                        onChange={(e) => setForm((s) => ({ ...s, [f.name]: e.target.checked }))}
                        className="h-4 w-4 rounded border-slate-300 text-brand-500 focus:ring-brand-400"
                      />
                      <span className="text-sm font-medium text-navy">{f.label}</span>
                    </label>
                  ) : f.type === 'number' ? (
                    <input
                      type="number"
                      value={Number(form[f.name] ?? 0)}
                      onChange={(e) => setForm((s) => ({ ...s, [f.name]: e.target.value }))}
                      className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
                    />
                  ) : f.type === 'datetime' ? (
                    <input
                      type="datetime-local"
                      value={String(form[f.name] ?? '')}
                      onChange={(e) => setForm((s) => ({ ...s, [f.name]: e.target.value }))}
                      className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
                    />
                  ) : (
                    <input
                      type="text"
                      value={String(form[f.name] ?? '')}
                      placeholder={f.placeholder}
                      onChange={(e) => setForm((s) => ({ ...s, [f.name]: e.target.value }))}
                      className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
                    />
                  )}

                  {f.help && <p className="mt-1 text-xs text-slate-400">{f.help}</p>}
                </div>
              ))}

              {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}
            </div>

            <div className="sticky bottom-0 flex justify-end gap-3 border-t border-slate-100 bg-white px-6 py-4">
              <button onClick={() => setOpen(false)} className="btn-ghost !py-2.5">Cancel</button>
              <button onClick={submit} disabled={pending} className="btn-primary !py-2.5">
                {pending && <Loader2 size={16} className="animate-spin" />}
                {editing ? 'Save changes' : `Create ${singular}`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
