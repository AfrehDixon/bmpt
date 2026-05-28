import Link from 'next/link';
import { ExternalLink, Pencil } from 'lucide-react';
import { prisma } from '@/lib/prisma';
import PagesNewButton from './PagesNewButton';

export const dynamic = 'force-dynamic';

export default async function PagesAdmin() {
  const pages = await prisma.page.findMany({
    orderBy: { updatedAt: 'desc' },
    include: { _count: { select: { sections: true } } },
  });

  return (
    <div>
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-navy">Custom Pages</h1>
          <p className="mt-1 text-sm text-slate-500">
            Build any new page (e.g. <code>/products</code>) and attach it to a nav item with a matching link.
          </p>
        </div>
        <PagesNewButton />
      </div>

      <div className="mt-6 overflow-hidden rounded-xl border border-slate-200 bg-white">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3 font-semibold">Title</th>
              <th className="px-4 py-3 font-semibold">Slug</th>
              <th className="px-4 py-3 font-semibold">Sections</th>
              <th className="px-4 py-3 font-semibold">Status</th>
              <th className="px-4 py-3 text-right font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {pages.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-slate-400">
                  No custom pages yet — click <strong>New Page</strong> to create one.
                </td>
              </tr>
            )}
            {pages.map((p) => (
              <tr key={p.id} className="hover:bg-slate-50/60">
                <td className="px-4 py-3">
                  <p className="font-medium text-navy">{p.title}</p>
                  <p className="text-xs text-slate-500">{p.heroTitle || '—'}</p>
                </td>
                <td className="px-4 py-3 font-mono text-xs text-slate-600">/{p.slug}</td>
                <td className="px-4 py-3 text-xs text-slate-500">{p._count.sections}</td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${p.isPublished ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                    {p.isPublished ? 'Published' : 'Draft'}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-1">
                    {p.isPublished && (
                      <a
                        href={`/${p.slug}`}
                        target="_blank"
                        rel="noreferrer"
                        className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-navy"
                        title="View on site"
                      >
                        <ExternalLink size={16} />
                      </a>
                    )}
                    <Link
                      href={`/admin/pages/${p.id}`}
                      className="rounded-lg p-2 text-slate-500 hover:bg-brand-50 hover:text-brand-600"
                      title="Edit"
                    >
                      <Pencil size={16} />
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
