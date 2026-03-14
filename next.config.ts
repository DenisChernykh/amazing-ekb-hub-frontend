import type { NextConfig } from 'next';

const apiProxyTarget = process.env.API_PROXY_TARGET?.replace(/\/+$/, '');

const nextConfig: NextConfig = {
  async rewrites() {
    if (!apiProxyTarget) {
      return [];
    }

    return [
      {
        source: '/v1/:path*',
        destination: `${apiProxyTarget}/v1/:path*`,
      },
    ];
  },
};

export default nextConfig;
