import { prisma } from '@/lib/prisma';
import CrudManager from '@/components/admin/CrudManager';
import type { FieldSpec } from '@/components/admin/types';

export const dynamic = 'force-dynamic';

const fields: FieldSpec[] = [
  { name: 'label', label: 'Label', type: 'text', required: true, placeholder: 'Happy Clients' },
  { name: 'value', label: 'Number', type: 'number', required: true, default: 0 },
  { name: 'suffix', label: 'Suffix', type: 'text', placeholder: '+ / k / %', default: '' },
  {
    name: 'icon',
    label: 'Icon',
    type: 'text',
    help: 'Any lucide-react icon name, e.g. Users, Award, CheckCircle2, Briefcase.',
    default: 'Users',
  },
  { name: 'order', label: 'Order', type: 'number', default: 0 },
  { name: 'isActive', label: 'Active', type: 'boolean', default: true },
];

export default async function StatsAdmin() {
  const rows = await prisma.stat.findMany({ orderBy: { order: 'asc' } });
  return (
    <CrudManager model="Stat" title="Stats / Facts" singular="Stat" fields={fields} rows={rows as never} />
  );
}
