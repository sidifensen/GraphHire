import type { NextConfig } from 'next';
import path from 'node:path';

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
      { protocol: 'https', hostname: 'picsum.photos' },
    ],
  },
  webpack(config) {
    config.resolve.alias = {
      ...(config.resolve.alias ?? {}),
      'react-router-dom': path.resolve(__dirname, 'src/shims/react-router-dom.tsx'),
      'motion/react': 'framer-motion',
    };
    return config;
  },
};

export default nextConfig;
