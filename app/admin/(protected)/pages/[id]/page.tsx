import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, ExternalLink } from 'lucide-react';
import { prisma } from '@/lib/prisma';
import CrudManager from '@/components/admin/CrudManager';
import type { FieldSpec } from '@/components/admin/types';
import PageMetaForm from './PageMetaForm';

export const dynamic = 'force-dynamic';

export default async function PageEdit({ params }: { params: { id: string } }) {
  const page = await prisma.page.findUnique({
    where: { id: params.id },
    include: { sections: { orderBy: { order: 'asc' } } },
  });
  if (!page) notFound();

  const sectionFields: FieldSpec[] = [
    { name: 'heading', label: 'Heading', type: 'text', placeholder: 'Built for growing businesses' },
    {
      name: 'layout',
      label: 'Layout',
      type: 'select',
      default: 'IMAGE_LEFT',
      options: [
        { value: 'IMAGE_LEFT', label: 'Image left, text right' },
        { value: 'IMAGE_RIGHT', label: 'Image right, text left' },
        { value: 'TEXT_ONLY', label: 'Text only (centered)' },
        { value: 'IMAGE_FULL', label: 'Full-width image with overlay' },
        { value: 'CARD', label: 'Centered card' },
      ],
    },
    {
      name: 'background',
      label: 'Background',
      type: 'select',
      default: 'WHITE',
      hideInList: true,
      options: [
        { value: 'WHITE', label: 'White' },
        { value: 'LIGHT', label: 'Light gray' },
        { value: 'NAVY', label: 'Navy (dark)' },
        { value: 'BRAND', label: 'Brand cyan' },
      ],
    },
    { name: 'eyebrow', label: 'Eyebrow text', type: 'text', placeholder: 'Why us', hideInList: true },
    { name: 'body', label: 'Body (HTML)', type: 'html', hideInList: true },
    { name: 'imageUrl', label: 'Image', type: 'image', uploadPurpose: `page-${page.slug}`, hideInList: true },
    { name: 'imageAlt', label: 'Image alt text', type: 'text', hideInList: true },
    { name: 'ctaText', label: 'Button text (optional)', type: 'text', hideInList: true },
    { name: 'ctaLink', label: 'Button link', type: 'text', hideInList: true },
    { name: 'order', label: 'Order', type: 'number', default: (page.sections.length + 1) * 10, hideInList: true },
    { name: 'isActive', label: 'Active', type: 'boolean', default: true },
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <Link href="/admin/pages" className="inline-flex items-center gap-1 text-sm text-brand-600 hover:underline">
            <ArrowLeft size={14} /> All pages
          </Link>
          <h1 className="mt-2 font-display text-2xl font-bold text-navy">{page.title}</h1>
          <p className="text-sm text-slate-500">
            URL: <span className="font-mono">/{page.slug}</span>
            {page.isPublished ? (
              <span className="ml-3 rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700">Published</span>
            ) : (
              <span className="ml-3 rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">Draft</span>
            )}
          </p>
        </div>
        {page.isPublished && (
          <a
            href={`/${page.slug}`}
            target="_blank"
            rel="noreferrer"
            className="btn-ghost !py-2.5"
          >
            <ExternalLink size={14} /> View on site
          </a>
        )}
      </div>

      <div className="rounded-2xl border border-slate-100 bg-white p-6">
        <h2 className="font-display text-base font-semibold text-navy">Page details</h2>
        <p className="mt-1 text-xs text-slate-500">Title, hero, SEO and publish state.</p>
        <div className="mt-5">
          <PageMetaForm initial={page} />
        </div>
      </div>

      <div className="rounded-2xl border border-slate-100 bg-white p-6">
        <div className="mb-4">
          <h2 className="font-display text-base font-semibold text-navy">Page sections</h2>
          <p className="mt-1 text-xs text-slate-500">
            Build the page by adding sections in order. Each section can have a heading, body, image and layout.
          </p>
        </div>
        <CrudManager
          model="PageSection"
          title="Page sections"
          singular="Section"
          fields={sectionFields}
          rows={page.sections as never}
          defaultData={{ pageId: page.id }}
          hideTitle
        />
      </div>
    </div>
  );
}
