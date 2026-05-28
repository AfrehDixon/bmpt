/**
 * Create and configure the AWS S3 bucket used for CMS media.
 *
 *   1. Fill AWS_ACCESS_KEY_ID / AWS_SECRET_ACCESS_KEY / AWS_REGION /
 *      AWS_S3_BUCKET_NAME in .env (see .env.example).
 *   2. Run:  npm run s3:setup
 *
 * The script is idempotent: it will skip steps that already exist and
 * print a final summary. It will:
 *   • create the bucket if it doesn't exist (in AWS_REGION)
 *   • disable "Block Public Access" so objects can be served publicly
 *   • apply a permissive read-only bucket policy
 *   • apply a CORS policy allowing PUTs from your NEXTAUTH_URL origin
 */
import {
  S3Client,
  CreateBucketCommand,
  HeadBucketCommand,
  PutBucketPolicyCommand,
  PutBucketCorsCommand,
  PutPublicAccessBlockCommand,
} from '@aws-sdk/client-s3';

const region = process.env.AWS_REGION || 'us-east-1';
const bucket = process.env.AWS_S3_BUCKET_NAME;
const origin = process.env.NEXTAUTH_URL || 'http://localhost:3000';

if (!bucket) {
  console.error('❌ AWS_S3_BUCKET_NAME is not set in .env');
  process.exit(1);
}
if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
  console.error('❌ AWS credentials missing in .env (AWS_ACCESS_KEY_ID / AWS_SECRET_ACCESS_KEY)');
  process.exit(1);
}

const s3 = new S3Client({
  region,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

async function exists(): Promise<boolean> {
  try {
    await s3.send(new HeadBucketCommand({ Bucket: bucket }));
    return true;
  } catch {
    return false;
  }
}

async function main() {
  console.log(`🪣  Setting up bucket "${bucket}" in ${region}…`);

  if (await exists()) {
    console.log('   ✓ bucket already exists');
  } else {
    const create =
      region === 'us-east-1'
        ? { Bucket: bucket }
        : { Bucket: bucket, CreateBucketConfiguration: { LocationConstraint: region } };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await s3.send(new CreateBucketCommand(create as any));
    console.log('   ✓ bucket created');
  }

  await s3.send(
    new PutPublicAccessBlockCommand({
      Bucket: bucket,
      PublicAccessBlockConfiguration: {
        BlockPublicAcls: false,
        IgnorePublicAcls: false,
        BlockPublicPolicy: false,
        RestrictPublicBuckets: false,
      },
    }),
  );
  console.log('   ✓ public access block disabled');

  await s3.send(
    new PutBucketPolicyCommand({
      Bucket: bucket,
      Policy: JSON.stringify({
        Version: '2012-10-17',
        Statement: [
          {
            Sid: 'PublicReadGetObject',
            Effect: 'Allow',
            Principal: '*',
            Action: 's3:GetObject',
            Resource: `arn:aws:s3:::${bucket}/*`,
          },
        ],
      }),
    }),
  );
  console.log('   ✓ public-read bucket policy applied');

  await s3.send(
    new PutBucketCorsCommand({
      Bucket: bucket,
      CORSConfiguration: {
        CORSRules: [
          {
            AllowedOrigins: [origin, 'http://localhost:3000', 'https://bmptsolutions.com'],
            AllowedMethods: ['GET', 'PUT', 'POST', 'HEAD'],
            AllowedHeaders: ['*'],
            ExposeHeaders: ['ETag'],
            MaxAgeSeconds: 3000,
          },
        ],
      },
    }),
  );
  console.log('   ✓ CORS rules applied');

  console.log('\n✅ S3 ready.');
  console.log(`   Public base URL:  https://${bucket}.s3.${region}.amazonaws.com`);
  console.log('   Make sure AWS_S3_BASE_URL in .env matches that value.');
}

main().catch((e) => {
  console.error('❌ S3 setup failed:', e?.message || e);
  process.exit(1);
});
