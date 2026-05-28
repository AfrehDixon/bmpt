import { prisma } from '@/lib/prisma';
import CrudManager from '@/components/admin/CrudManager';
import type { FieldSpec, CrudRow } from '@/components/admin/types';
import NavContentButton from './NavContentButton';

export const dynamic = 'force-dynamic';

// Keep in sync with `RESERVED_SLUGS` in app/admin/actions.ts.
const RESERVED = new Set([
  'about', 'services', 'contact', 'blog', 'admin', 'api',
  'sitemap.xml', 'robots.txt', '_next', 'images',
]);

type ContentStatus = 'edit' | 'create' | 'external' | 'builtin' | 'home' | 'invalid';

function classifyHref(href: string): { status: ContentStatus; slug: string | null } {
  if (!href) return { status: 'invalid', slug: null };
  if (href.startsWith('http://') || href.startsWith('https://')) return { status: 'external', slug: null };
  if (href.startsWith('mailto:') || href.startsWith('tel:')) return { status: 'external', slug: null };

  const path = href.split('#')[0].split('?')[0].replace(/^\/+|\/+$/g, '');
  if (!path) return { status: 'home', slug: null };
  if (path.includes('/')) return { status: 'invalid', slug: null };
  if (RESERVED.has(path)) return { status: 'builtin', slug: null };
  if (!/^[a-z0-9-]+$/i.test(path)) return { status: 'invalid', slug: null };
  return { status: 'edit', slug: path.toLowerCase() };
}

export default async function NavAdmin() {
  const rows = await prisma.navItem.findMany({ orderBy: [{ parentId: 'asc' }, { order: 'asc' }] });

  // One round-trip: load every slug that already has a page so the table
  // can show "Edit content" vs "Add content" without N+1 queries.
  const pageRows = await prisma.page.findMany({ select: { id: true, slug: true } });
  const pageBySlug = new Map(pageRows.map((p) => [p.slug, p.id]));

  const parentMap = new Map(rows.filter((r) => !r.parentId).map((p) => [p.id, p.label]));
  const display = rows.map((r) => {
    const { status, slug } = classifyHref(r.href);
    const pageId = slug ? pageBySlug.get(slug) ?? null : null;
    const finalStatus: ContentStatus = pageId ? 'edit' : status === 'edit' ? 'create' : status;
    return {
      ...r,
      label: r.parentId ? `   ↳ ${r.label}` : r.label,
      parentLabel: r.parentId ? parentMap.get(r.parentId) || '—' : '— (top level)',
      _contentStatus: finalStatus,
      _pageId: pageId,
    };
  });

  const parentOptions = [
    { value: '', label: '— Top-level link —' },
    ...rows.filter((r) => !r.parentId).map((r) => ({ value: r.id, label: r.label.trim() })),
  ];

  const fields: FieldSpec[] = [
    { name: 'label', label: 'Label', type: 'text', required: true, placeholder: 'Products' },
    {
      name: 'href',
      label: 'Link / URL',
      type: 'text',
      required: true,
      placeholder: '/products',
      default: '',
      help:
        'Use /products for a new custom page (you can then click "Add content" to build it). Use / only for the home link, or a full https://… URL for an external site.',
    },
    { name: 'parentLabel', label: 'Under', type: 'text', displayOnly: true },
    {
      name: 'parentId',
      label: 'Parent menu (optional)',
      type: 'select',
      options: parentOptions,
      hideInList: true,
      help: 'Leave blank to make this a top-level link. Select a parent to make it a dropdown item under that menu.',
    },
    { name: 'order', label: 'Order', type: 'number', default: 0, hideInList: true, help: 'Lower numbers appear first.' },
    { name: 'opensNewTab', label: 'Open in new tab', type: 'boolean', default: false, hideInList: true },
    { name: 'isActive', label: 'Active (show in menu)', type: 'boolean', default: true, hideInList: true },
  ];

  return (
    <div>
      <CrudManager
        model="NavItem"
        title="Navigation Menu"
        singular="Menu Item"
        fields={fields}
        rows={display as unknown as CrudRow[]}
        extraColumn={{
          header: 'Content',
          // Pre-render each row's cell on the server so the function
          // boundary never crosses into the client CrudManager.
          cells: Object.fromEntries(
            display.map((row) => [
              row.id,
              <NavContentButton
                key={row.id}
                navId={row.id}
                status={row._contentStatus}
                pageId={row._pageId}
              />,
            ]),
          ),
        }}
      />
      <div className="mt-8 rounded-2xl border border-slate-100 bg-white p-6 text-sm text-slate-600">
        <h2 className="font-display text-base font-semibold text-navy">Add content directly from here</h2>
        <ul className="mt-3 list-disc space-y-1 pl-5">
          <li>To get an <strong>Add content</strong> button, the <strong>Link / URL</strong> must be a path like <code>/products</code> — not <code>/</code>.</li>
          <li>Click <strong>Add content</strong> → a draft page is created at that path and the editor opens automatically.</li>
          <li>Once content exists, the column shows <strong>Edit content</strong> instead and takes you straight to the same editor.</li>
          <li><code>/</code> is the home link (no separate page to edit). External URLs (<code>https://…</code>) and the built-in pages (<code>/about</code>, <code>/services</code>, <code>/contact</code>, <code>/blog</code>) are managed in their own admin sections.</li>
        </ul>
      </div>
      <div className="mt-6 rounded-2xl border border-slate-100 bg-white p-6 text-sm text-slate-600">
        <h2 className="font-display text-base font-semibold text-navy">How sub-nav works</h2>
        <ul className="mt-3 list-disc space-y-1 pl-5">
          <li>Leave <strong>Parent menu</strong> empty to create a top-level link.</li>
          <li>Select an existing top-level link as the parent to make this item appear in its dropdown.</li>
          <li>One level of dropdown is supported — children can&apos;t have their own children.</li>
          <li>Use <strong>Order</strong> to sort items within the same parent (or among top-level links).</li>
          <li>Deleting a parent also deletes its children (cascade).</li>
        </ul>
      </div>
    </div>
  );
}
