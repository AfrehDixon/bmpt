/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      // AWS S3 bucket for CMS-uploaded media
      { protocol: 'https', hostname: '*.amazonaws.com' },
    ],
    // Memory tuning for the in-process image optimizer:
    // - webp only — AVIF encoding is by far the most RAM-hungry codec.
    // - cache optimized images for 31 days so we re-encode far less often.
    // - trim the size variants so fewer derivatives are generated/held.
    formats: ['image/webp'],
    minimumCacheTTL: 2678400,
    deviceSizes: [640, 828, 1200, 1920],
    imageSizes: [96, 256],
  },
  eslint: {
    // CMS is internal tooling; don't block production builds on lint.
    ignoreDuringBuilds: true,
  },
};

module.exports = nextConfig;
