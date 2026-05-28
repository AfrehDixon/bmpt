import { prisma } from '@/lib/prisma';
import CrudManager from '@/components/admin/CrudManager';
import type { FieldSpec } from '@/components/admin/types';

export const dynamic = 'force-dynamic';

const fields: FieldSpec[] = [
  { name: 'title', label: 'Title', type: 'text', required: true },
  { name: 'slug', label: 'Slug', type: 'text', required: true, help: 'URL e.g. /blog/your-slug' },
  { name: 'category', label: 'Category', type: 'text', default: 'News' },
  { name: 'excerpt', label: 'Excerpt', type: 'textarea' },
  { name: 'body', label: 'Body (HTML)', type: 'html' },
  { name: 'coverImage', label: 'Cover image', type: 'image', uploadPurpose: 'blog' },
  { name: 'isPublished', label: 'Published', type: 'boolean', default: false, hideInList: true },
  { name: 'publishedAt', label: 'Published at', type: 'datetime', hideInList: true },
];

export default async function BlogAdmin() {
  const rows = await prisma.blogPost.findMany({ orderBy: { createdAt: 'desc' } });
  return <CrudManager model="BlogPost" title="Blog Posts" singular="Post" fields={fields} rows={rows as never} />;
}
