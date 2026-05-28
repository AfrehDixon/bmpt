import { NextResponse } from 'next/server';
import { isAdmin } from '@/lib/admin';
import { prisma } from '@/lib/prisma';

/**
 * Admin-only: list recent media library assets so the ImageField browser
 * modal can show previously uploaded images for re-use.
 *
 *   GET /api/media?purpose=hero&limit=60
 */
export async function GET(req: Request) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const url = new URL(req.url);
  const purpose = url.searchParams.get('purpose')?.trim();
  const limit = Math.min(Number(url.searchParams.get('limit') || 60) || 60, 200);

  const where = purpose
    ? { OR: [{ alt: { contains: purpose } }, { key: { startsWith: `${purpose}/` } }] }
    : {};

  const rows = await prisma.mediaAsset.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    take: limit,
    select: { id: true, url: true, key: true, filename: true, alt: true, createdAt: true },
  });
  return NextResponse.json({ items: rows });
}
