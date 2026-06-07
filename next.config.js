/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      // AWS S3 bucket for CMS-uploaded media
      { protocol: 'https', hostname: '*.amazonaws.com' },
    ],
    // Images already live on S3 — serve them directly instead of running
    // them through Next's in-process optimizer. This is what was driving
    // memory up (and the optimizer was failing to serve some images).
    // Trade-off: no automatic resize/webp, but far lower RAM and images
    // load straight from S3 with no /_next/image dependency.
    unoptimized: true,
  },
  eslint: {
    // CMS is internal tooling; don't block production builds on lint.
    ignoreDuringBuilds: true,
  },
};

module.exports = nextConfig;
