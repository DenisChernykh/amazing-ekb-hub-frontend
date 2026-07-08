import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

import type { NextConfig } from 'next';

const configDir = dirname(fileURLToPath(import.meta.url));

function normalizeApiBaseUrl(apiBaseUrl: string): string {
  return apiBaseUrl.replace(/\/+$/, '');
}

const nextConfig: NextConfig = {
  output: 'standalone',
  outputFileTracingRoot: configDir,
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
