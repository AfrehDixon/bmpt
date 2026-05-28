/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      // AWS S3 bucket for CMS-uploaded media
      { protocol: 'https', hostname: '*.amazonaws.com' },
    ],
  },
  eslint: {
    // CMS is internal tooling; don't block production builds on lint.
    ignoreDuringBuilds: true,
  },
};

module.exports = nextConfig;
