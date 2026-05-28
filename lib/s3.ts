import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import slugify from 'slugify';

const region = process.env.AWS_REGION || 'us-east-1';
const bucket = process.env.AWS_S3_BUCKET_NAME || '';
const baseUrl =
  process.env.AWS_S3_BASE_URL ||
  `https://${bucket}.s3.${region}.amazonaws.com`;

export const s3 = new S3Client({
  region,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
});

export const S3_BUCKET = bucket;
export const S3_BASE_URL = baseUrl;

/**
 * Build a descriptive, collision-safe S3 key.
 * Example: ("hero", "Business Formalization.png", "image/png")
 *   → "hero/business-formalization-1716845000000.png"
 *
 * The `purpose` folder + slugified name make the object self-describing,
 * exactly what the brief asked for ("the name will describe what it is").
 */
export function buildKey(purpose: string, originalName: string): string {
  const dot = originalName.lastIndexOf('.');
  const ext = dot > -1 ? originalName.slice(dot + 1).toLowerCase() : 'bin';
  const base = dot > -1 ? originalName.slice(0, dot) : originalName;
  const safeName = slugify(base, { lower: true, strict: true }) || 'file';
  const folder = slugify(purpose || 'media', { lower: true, strict: true });
  return `${folder}/${safeName}-${Date.now()}.${ext}`;
}

export function publicUrl(key: string): string {
  return `${baseUrl.replace(/\/$/, '')}/${key}`;
}

/**
 * Create a short-lived presigned PUT url so the browser can upload
 * straight to S3 without proxying bytes through the Next.js server.
 */
export async function createUploadUrl(opts: {
  purpose: string;
  filename: string;
  contentType: string;
}): Promise<{ uploadUrl: string; key: string; url: string }> {
  const key = buildKey(opts.purpose, opts.filename);
  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    ContentType: opts.contentType,
  });
  const uploadUrl = await getSignedUrl(s3, command, { expiresIn: 60 });
  return { uploadUrl, key, url: publicUrl(key) };
}

export async function deleteObject(key: string): Promise<void> {
  await s3.send(new DeleteObjectCommand({ Bucket: bucket, Key: key }));
}

export function isS3Configured(): boolean {
  return Boolean(
    bucket &&
      process.env.AWS_ACCESS_KEY_ID &&
      process.env.AWS_ACCESS_KEY_ID !== 'your-access-key-id' &&
      process.env.AWS_SECRET_ACCESS_KEY,
  );
}
