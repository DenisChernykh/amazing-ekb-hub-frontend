import { describe, expect, it } from 'vitest';

describe('Next.js cache configuration', () => {
  it('enables Cache Components', async () => {
    const { default: nextConfig } = await import('../next.config');

    expect(nextConfig.cacheComponents).toBe(true);
  });
});
