import { describe, expect, it, vi } from 'vitest';

describe('nextConfig rewrites', () => {
  it('proxies browser /v1 requests to API_BASE_URL', async () => {
    vi.stubEnv('API_BASE_URL', 'http://127.0.0.1:3000');
    vi.resetModules();

    const { default: nextConfig } = await import('../next.config');
    const rewrites = await nextConfig.rewrites?.();

    expect(rewrites).toEqual([
      {
        source: '/v1/:path*',
        destination: 'http://127.0.0.1:3000/v1/:path*',
      },
    ]);
  });

  it('normalizes trailing slashes from API_BASE_URL', async () => {
    vi.stubEnv('API_BASE_URL', 'http://127.0.0.1:3000///');
    vi.resetModules();

    const { default: nextConfig } = await import('../next.config');
    const rewrites = await nextConfig.rewrites?.();

    expect(rewrites).toEqual([
      {
        source: '/v1/:path*',
        destination: 'http://127.0.0.1:3000/v1/:path*',
      },
    ]);
  });

  it('does not install /v1 rewrites without API_BASE_URL', async () => {
    vi.stubEnv('API_BASE_URL', '');
    vi.resetModules();

    const { default: nextConfig } = await import('../next.config');
    const rewrites = await nextConfig.rewrites?.();

    expect(rewrites).toEqual([]);
  });
});
