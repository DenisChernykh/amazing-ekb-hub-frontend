import { describe, expect, it } from 'vitest';
import { normalizeMaterialUrl } from './normalize-material-url';

describe('normalizeMaterialUrl', () => {
  it.each([
    ['dzen', 'https://dzen.ru/video/aquacity-start'],
    ['telegram', 'https://t.me/amazing_ekb/321'],
    ['instagram', 'https://www.instagram.com/reel/spa-evening'],
  ] as const)('keeps safe %s URLs', (platform, url) => {
    expect(normalizeMaterialUrl(url, platform)).toBe(url);
  });

  it.each([
    ['telegram', 'javascript:alert(1)'],
    ['telegram', 'data:text/html,<script>alert(1)</script>'],
    ['telegram', 'not a url'],
    ['telegram', 'https://t.me.evil.example/amazing_ekb'],
    ['dzen', 'https://evil.example/video/aquacity-start'],
    ['instagram', 'https://instagram.com.evil.example/reel/spa-evening'],
  ] as const)('rejects unsafe or unsupported %s URLs', (platform, url) => {
    expect(normalizeMaterialUrl(url, platform)).toBeNull();
  });
});
