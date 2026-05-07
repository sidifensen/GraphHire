import type { NextConfig } from 'next';
import path from 'node:path';

const isDev = process.env.NODE_ENV === 'development';
const explicitApiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://127.0.0.1:7777';
let apiOrigin = '';
try {
  apiOrigin = new URL(explicitApiBaseUrl).origin;
} catch {
  apiOrigin = '';
}

const imgSrcParts = ["'self'", 'data:', 'blob:', 'https:'];
if (isDev) {
  imgSrcParts.push('http:');
}
if (apiOrigin) {
  imgSrcParts.push(apiOrigin);
}
const imgSrcDirective = `img-src ${Array.from(new Set(imgSrcParts)).join(' ')};`;

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
      { protocol: 'https', hostname: 'picsum.photos' },
    ],
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
          {
            key: 'Content-Security-Policy',
            value:
              `default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; ${imgSrcDirective} font-src 'self' data:; connect-src 'self' http: https: ws: wss:; frame-ancestors 'none'; object-src 'none'; base-uri 'self'; form-action 'self'`,
          },
        ],
      },
    ];
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
