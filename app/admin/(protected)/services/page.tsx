import { prisma } from '@/lib/prisma';
import CrudManager from '@/components/admin/CrudManager';
import type { FieldSpec } from '@/components/admin/types';

export const dynamic = 'force-dynamic';

const fields: FieldSpec[] = [
  { name: 'title', label: 'Title', type: 'text', required: true },
  { name: 'slug', label: 'Slug', type: 'text', required: true, help: 'URL-safe identifier, e.g. accounting-bookkeeping' },
  { name: 'shortDesc', label: 'Short description', type: 'textarea', required: true },
  {
    name: 'body',
    label: 'Full description (HTML)',
    type: 'html',
    help: 'Rich content shown on the services page. Use <p>, <h3>, <ul>, <strong>, etc.',
  },
  {
    name: 'icon',
    label: 'Icon',
    type: 'text',
    help: 'lucide-react icon name e.g. Calculator, Code2, Building2, GraduationCap.',
    default: 'ShieldCheck',
  },
  { name: 'imageUrl', label: 'Optional image', type: 'image', uploadPurpose: 'services' },
  { name: 'order', label: 'Order', type: 'number', default: 0 },
  { name: 'isActive', label: 'Active', type: 'boolean', default: true },
];

export default async function ServicesAdmin() {
  const rows = await prisma.service.findMany({ orderBy: { order: 'asc' } });
  return <CrudManager model="Service" title="Services" singular="Service" fields={fields} rows={rows as never} />;
}
