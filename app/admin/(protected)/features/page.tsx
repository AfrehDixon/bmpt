import { prisma } from '@/lib/prisma';
import CrudManager from '@/components/admin/CrudManager';
import type { FieldSpec } from '@/components/admin/types';

export const dynamic = 'force-dynamic';

const fields: FieldSpec[] = [
  { name: 'title', label: 'Title', type: 'text', required: true },
  { name: 'description', label: 'Description', type: 'textarea', required: true },
  {
    name: 'icon',
    label: 'Icon',
    type: 'text',
    help: 'lucide-react name e.g. Award, Boxes, Headphones, UsersRound.',
    default: 'CheckCircle',
  },
  { name: 'order', label: 'Order', type: 'number', default: 0 },
  { name: 'isActive', label: 'Active', type: 'boolean', default: true },
];

export default async function FeaturesAdmin() {
  const rows = await prisma.feature.findMany({ orderBy: { order: 'asc' } });
  return <CrudManager model="Feature" title="Why Choose Us" singular="Feature" fields={fields} rows={rows as never} />;
}
