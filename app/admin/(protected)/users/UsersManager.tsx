'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Pencil, Trash2, X, Loader2, ShieldCheck, User as UserIcon } from 'lucide-react';
import { createAdminUser, updateAdminUser, deleteAdminUser } from '@/app/admin/actions';

type Role = 'SUPER_ADMIN' | 'EDITOR';
type Admin = {
  id: string;
  email: string;
  name: string;
  role: Role;
  isActive: boolean;
  createdAt: string;
};

const inputCls =
  'w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100';

export default function UsersManager({
  users,
  isSuper,
  currentUserId,
}: {
  users: Admin[];
  isSuper: boolean;
  currentUserId: string | null;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Admin | null>(null);
  const [form, setForm] = useState({
    email: '',
    name: '',
    password: '',
    role: 'EDITOR' as Role,
    isActive: true,
  });
  const [error, setError] = useState('');
  const [pending, startTransition] = useTransition();

  function openNew() {
    setEditing(null);
    setForm({ email: '', name: '', password: '', role: 'EDITOR', isActive: true });
    setError('');
    setOpen(true);
  }

  function openEdit(u: Admin) {
    setEditing(u);
    setForm({ email: u.email, name: u.name, password: '', role: u.role, isActive: u.isActive });
    setError('');
    setOpen(true);
  }

  function submit() {
    setError('');
    startTransition(async () => {
      const res = editing
        ? await updateAdminUser({
            id: editing.id,
            name: form.name,
            role: form.role,
            isActive: form.isActive,
            newPassword: form.password || undefined,
          })
        : await createAdminUser({
            email: form.email,
            name: form.name,
            password: form.password,
            role: form.role,
          });
      if (res?.error) setError(res.error);
      else {
        setOpen(false);
        router.refresh();
      }
    });
  }

  function remove(u: Admin) {
    if (!confirm(`Delete admin ${u.email}? This cannot be undone.`)) return;
    startTransition(async () => {
      const res = await deleteAdminUser(u.id);
      if (res?.error) alert(res.error);
      else router.refresh();
    });
  }

  return (
    <div>
      <div className="mb-4 flex justify-end">
        {isSuper && (
          <button onClick={openNew} className="btn-primary !py-2.5">
            <Plus size={16} /> Add admin
          </button>
        )}
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3 font-semibold">User</th>
              <th className="px-4 py-3 font-semibold">Role</th>
              <th className="px-4 py-3 font-semibold">Status</th>
              <th className="px-4 py-3 font-semibold">Added</th>
              {isSuper && <th className="px-4 py-3 text-right font-semibold">Actions</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {users.map((u) => (
              <tr key={u.id} className="hover:bg-slate-50/60">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-500/10 text-brand-600">
                      {u.role === 'SUPER_ADMIN' ? <ShieldCheck size={16} /> : <UserIcon size={16} />}
                    </div>
                    <div>
                      <p className="font-medium text-navy">
                        {u.name} {u.id === currentUserId && <span className="text-xs font-normal text-brand-600">(you)</span>}
                      </p>
                      <p className="text-xs text-slate-500">{u.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${u.role === 'SUPER_ADMIN' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600'}`}>
                    {u.role === 'SUPER_ADMIN' ? 'Super admin' : 'Editor'}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${u.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                    {u.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-4 py-3 text-xs text-slate-500">
                  {new Date(u.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                </td>
                {isSuper && (
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1">
                      <button onClick={() => openEdit(u)} className="rounded-lg p-2 text-slate-500 hover:bg-brand-50 hover:text-brand-600">
                        <Pencil size={16} />
                      </button>
                      <button
                        onClick={() => remove(u)}
                        disabled={u.id === currentUserId}
                        title={u.id === currentUserId ? "You can't delete yourself" : 'Delete'}
                        className="rounded-lg p-2 text-slate-500 hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-slate-500"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {open && (
        <div className="fixed inset-0 z-50 flex justify-end bg-navy/30" onClick={() => setOpen(false)}>
          <div className="thin-scroll h-full w-full max-w-md overflow-y-auto bg-white shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 flex items-center justify-between border-b border-slate-100 bg-white px-6 py-4">
              <h2 className="font-display text-lg font-bold text-navy">
                {editing ? `Edit ${editing.name}` : 'New admin'}
              </h2>
              <button onClick={() => setOpen(false)} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100">
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4 px-6 py-6">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-navy">Email</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm((s) => ({ ...s, email: e.target.value }))}
                  disabled={!!editing}
                  className={inputCls + (editing ? ' bg-slate-50 text-slate-500' : '')}
                />
                {editing && <p className="mt-1 text-xs text-slate-400">Email cannot be changed once an admin is created.</p>}
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-navy">Full name</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))}
                  className={inputCls}
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-navy">
                  {editing ? 'New password (optional)' : 'Password'}
                </label>
                <input
                  type="password"
                  value={form.password}
                  onChange={(e) => setForm((s) => ({ ...s, password: e.target.value }))}
                  placeholder={editing ? 'Leave blank to keep current password' : 'At least 8 characters'}
                  className={inputCls}
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-navy">Role</label>
                <select
                  value={form.role}
                  onChange={(e) => setForm((s) => ({ ...s, role: e.target.value as Role }))}
                  className={inputCls}
                >
                  <option value="EDITOR">Editor — can manage content</option>
                  <option value="SUPER_ADMIN">Super admin — can also manage other admins</option>
                </select>
              </div>
              {editing && (
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={form.isActive}
                    onChange={(e) => setForm((s) => ({ ...s, isActive: e.target.checked }))}
                    className="h-4 w-4 rounded border-slate-300 text-brand-500 focus:ring-brand-400"
                  />
                  <span className="text-sm font-medium text-navy">Active (can sign in)</span>
                </label>
              )}

              {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}
            </div>

            <div className="sticky bottom-0 flex justify-end gap-3 border-t border-slate-100 bg-white px-6 py-4">
              <button onClick={() => setOpen(false)} className="btn-ghost !py-2.5">Cancel</button>
              <button onClick={submit} disabled={pending} className="btn-primary !py-2.5">
                {pending && <Loader2 size={16} className="animate-spin" />}
                {editing ? 'Save changes' : 'Create admin'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
