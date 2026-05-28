import { prisma } from '@/lib/prisma';
import CrudManager from '@/components/admin/CrudManager';
import type { FieldSpec } from '@/components/admin/types';

export const dynamic = 'force-dynamic';

const fields: FieldSpec[] = [
  { name: 'message', label: 'Message', type: 'text', required: true, placeholder: '🎉 New: …' },
  { name: 'linkText', label: 'Link text', type: 'text', placeholder: 'Learn more' },
  { name: 'linkUrl', label: 'Link URL', type: 'text', placeholder: '/services' },
  {
    name: 'type',
    label: 'Style',
    type: 'select',
    default: 'INFO',
    options: [
      { value: 'INFO', label: 'Info (cyan)' },
      { value: 'SUCCESS', label: 'Success (green)' },
      { value: 'WARNING', label: 'Warning (amber)' },
      { value: 'PROMO', label: 'Promo (navy)' },
    ],
  },
  { name: 'isActive', label: 'Active (show on website)', type: 'boolean', default: false },
];

export default async function BannersAdmin() {
  const rows = await prisma.banner.findMany({ orderBy: { updatedAt: 'desc' } });
  return <CrudManager model="Banner" title="Info Banners" singular="Banner" fields={fields} rows={rows as never} />;
}
