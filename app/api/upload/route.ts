import { NextResponse } from 'next/server';
import { isAdmin } from '@/lib/admin';
import { createUploadUrl, isS3Configured } from '@/lib/s3';
import { prisma } from '@/lib/prisma';

/**
 * Issues a presigned S3 PUT URL so the admin browser can upload media
 * directly to the bucket. The object key is descriptive (purpose +
 * slugified filename), per the brief. Admin-only.
 */
export async function POST(req: Request) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  if (!isS3Configured()) {
    return NextResponse.json(
      { error: 'S3 is not configured. Add AWS credentials to .env or paste an image path manually.' },
      { status: 400 },
    );
  }

  const { purpose, filename, contentType, size } = await req.json();
  if (!filename || !contentType) {
    return NextResponse.json({ error: 'filename and contentType are required' }, { status: 400 });
  }

  const usedFor = (purpose || 'media').toString();
  const { uploadUrl, key, url } = await createUploadUrl({
    purpose: usedFor,
    filename,
    contentType,
  });

  // Record it in the media library with a description of *where it is used*
  // — that's what the brief asked for: "the image description that is stored
  // should be the name of where it has been used for".
  try {
    await prisma.mediaAsset.create({
      data: {
        key,
        url,
        filename,
        contentType,
        size: size || 0,
        alt: `Used in: ${usedFor}`,
      },
    });
  } catch {
    /* ignore */
  }

  return NextResponse.json({ uploadUrl, key, url });
}
