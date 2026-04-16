import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**.rustfs.example.com' },
      { protocol: 'https', hostname: 'cdn.example.com' },
    ],
    formats: ['image/avif', 'image/webp'],
  },
  transpilePackages: [
    '@ant-design/pro-components',
    '@ant-design/charts',
  ],
};

export default nextConfig;
