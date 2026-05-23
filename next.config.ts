import type { NextConfig } from 'next';

function normalizeApiBaseUrl(apiBaseUrl: string): string {
  return apiBaseUrl.replace(/\/+$/, '');
}

const nextConfig: NextConfig = {
  output: 'standalone',
  async rewrites() {
    const apiBaseUrl = process.env.API_BASE_URL;

    if (!apiBaseUrl) {
      return [];
    }

    return [
      {
        source: '/v1/:path*',
        destination: `${normalizeApiBaseUrl(apiBaseUrl)}/:path*`,
      },
    ];
  },
};

export default nextConfig;
