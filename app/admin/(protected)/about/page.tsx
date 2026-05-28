import { prisma } from '@/lib/prisma';
import CrudManager from '@/components/admin/CrudManager';
import type { FieldSpec } from '@/components/admin/types';

export const dynamic = 'force-dynamic';

const fields: FieldSpec[] = [
  { name: 'key', label: 'Section key', type: 'text', required: true, help: 'Unique key e.g. overview, mission, vision.' },
  { name: 'heading', label: 'Heading', type: 'text', required: true },
  { name: 'body', label: 'Body', type: 'textarea', required: true },
  { name: 'imageUrl', label: 'Image', type: 'image', uploadPurpose: 'about' },
  { name: 'order', label: 'Order', type: 'number', default: 0 },
  { name: 'isActive', label: 'Active', type: 'boolean', default: true },
];

export default async function AboutAdmin() {
  const rows = await prisma.aboutSection.findMany({ orderBy: { order: 'asc' } });
  return <CrudManager model="AboutSection" title="About Sections" singular="Section" fields={fields} rows={rows as never} />;
}
