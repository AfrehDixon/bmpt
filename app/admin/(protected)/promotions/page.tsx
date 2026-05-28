import { prisma } from '@/lib/prisma';
import CrudManager from '@/components/admin/CrudManager';
import type { FieldSpec } from '@/components/admin/types';

export const dynamic = 'force-dynamic';

const fields: FieldSpec[] = [
  { name: 'title', label: 'Title', type: 'text', required: true },
  { name: 'body', label: 'Body', type: 'textarea' },
  { name: 'imageUrl', label: 'Image (optional)', type: 'image', uploadPurpose: 'promotions' },
  { name: 'ctaText', label: 'Button text', type: 'text', default: 'Learn more' },
  { name: 'ctaLink', label: 'Button link', type: 'text', default: '/contact' },
  { name: 'isActive', label: 'Active (show modal on page load)', type: 'boolean', default: false },
  { name: 'startsAt', label: 'Start at (optional)', type: 'datetime', hideInList: true },
  { name: 'endsAt', label: 'End at (optional)', type: 'datetime', hideInList: true },
];

export default async function PromotionsAdmin() {
  const rows = await prisma.promotion.findMany({ orderBy: { updatedAt: 'desc' } });
  return <CrudManager model="Promotion" title="Promotions" singular="Promotion" fields={fields} rows={rows as never} />;
}
