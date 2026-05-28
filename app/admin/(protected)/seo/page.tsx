import { prisma } from '@/lib/prisma';
import CrudManager from '@/components/admin/CrudManager';
import type { FieldSpec } from '@/components/admin/types';

export const dynamic = 'force-dynamic';

const fields: FieldSpec[] = [
  {
    name: 'page',
    label: 'Page key',
    type: 'select',
    required: true,
    options: [
      { value: 'home', label: 'Home (/)' },
      { value: 'about', label: 'About (/about)' },
      { value: 'services', label: 'Services (/services)' },
      { value: 'contact', label: 'Contact (/contact)' },
      { value: 'blog', label: 'Blog (/blog)' },
    ],
  },
  { name: 'title', label: 'Title tag', type: 'text', required: true },
  { name: 'description', label: 'Meta description', type: 'textarea', required: true },
  { name: 'keywords', label: 'Keywords (comma separated)', type: 'text' },
  { name: 'ogImage', label: 'Open Graph image', type: 'image', uploadPurpose: 'seo' },
  { name: 'noIndex', label: 'Hide from search engines', type: 'boolean', default: false },
];

export default async function SeoAdmin() {
  const rows = await prisma.seoMeta.findMany({ orderBy: { page: 'asc' } });
  return (
    <div>
      <CrudManager model="SeoMeta" title="SEO Metadata" singular="Page" fields={fields} rows={rows as never} />
      <div className="mt-8 rounded-2xl border border-slate-100 bg-white p-6 text-sm text-slate-600">
        <h2 className="font-display text-base font-semibold text-navy">Sitemap &amp; robots</h2>
        <p className="mt-2">
          The sitemap is generated automatically at{' '}
          <a href="/sitemap.xml" target="_blank" className="text-brand-600 hover:underline">/sitemap.xml</a>{' '}
          and includes every published blog post. robots.txt is served at{' '}
          <a href="/robots.txt" target="_blank" className="text-brand-600 hover:underline">/robots.txt</a>{' '}
          and disallows <code>/admin</code> and <code>/api</code>.
        </p>
      </div>
    </div>
  );
}
