import { prisma } from '@/lib/prisma';
import CrudManager from '@/components/admin/CrudManager';
import type { FieldSpec } from '@/components/admin/types';

export const dynamic = 'force-dynamic';

const fields: FieldSpec[] = [
  { name: 'name', label: 'Partner name', type: 'text', required: true },
  { name: 'imageUrl', label: 'Logo image', type: 'image', uploadPurpose: 'partners', required: true },
  { name: 'linkUrl', label: 'Optional link', type: 'text' },
  { name: 'order', label: 'Order', type: 'number', default: 0 },
  { name: 'isActive', label: 'Active', type: 'boolean', default: true },
];

export default async function VendorsAdmin() {
  const rows = await prisma.vendor.findMany({ orderBy: { order: 'asc' } });
  return <CrudManager model="Vendor" title="Partners / Vendors" singular="Partner" fields={fields} rows={rows as never} />;
}
