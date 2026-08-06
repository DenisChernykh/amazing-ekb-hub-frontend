import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('next/font/google', () => ({
  Onest: () => ({ variable: '--font-onest' }),
}));

vi.mock('@/widgets/site-header', () => ({
  SiteHeader: () => null,
}));

describe('root metadata', () => {
  afterEach(() => {
    vi.resetModules();
    vi.unstubAllEnvs();
  });

  it('uses the validated public frontend origin as metadataBase', async () => {
    vi.stubEnv('PUBLIC_BASE_URL', 'https://guide.example.test///');

    const { metadata } = await import('./layout');

    expect(metadata.metadataBase).toEqual(new URL('https://guide.example.test/'));
  });
});
