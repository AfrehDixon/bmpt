import { prisma } from '@/lib/prisma';
import CrudManager from '@/components/admin/CrudManager';
import type { FieldSpec } from '@/components/admin/types';

export const dynamic = 'force-dynamic';

const fields: FieldSpec[] = [
  { name: 'title', label: 'Headline', type: 'text', required: true, placeholder: 'Business Formalization & Regulatory Compliance' },
  { name: 'eyebrow', label: 'Eyebrow text', type: 'text', default: 'What We Do' },
  { name: 'ctaText', label: 'Button text', type: 'text', default: 'Contact Us' },
  { name: 'ctaLink', label: 'Button link', type: 'text', default: '/contact' },
  { name: 'imageUrl', label: 'Background image', type: 'image', uploadPurpose: 'hero', required: true },
  { name: 'order', label: 'Order', type: 'number', default: 0 },
  { name: 'isActive', label: 'Active (show on website)', type: 'boolean', default: true },
];

export default async function HeroAdmin() {
  const rows = await prisma.heroSlide.findMany({ orderBy: { order: 'asc' } });
  return (
    <CrudManager
      model="HeroSlide"
      title="Hero Slides"
      singular="Slide"
      fields={fields}
      rows={rows as never}
    />
  );
}
