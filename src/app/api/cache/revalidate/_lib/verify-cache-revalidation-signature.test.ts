import { createHmac } from 'node:crypto';
import { describe, expect, it } from 'vitest';
import { verifyCacheRevalidationSignature } from './verify-cache-revalidation-signature';

const SECRET = 'a-secure-cache-revalidation-secret';
const NOW_SECONDS = 1_785_000_000;
const RAW_BODY = '{"schemaVersion":1}';

function sign(timestampHeader: string, rawBody = RAW_BODY) {
  return `sha256=${createHmac('sha256', SECRET)
    .update(`${timestampHeader}.${rawBody}`, 'utf8')
    .digest('hex')}`;
}

function verify(overrides: Partial<Parameters<typeof verifyCacheRevalidationSignature>[0]> = {}) {
  const timestampHeader = String(NOW_SECONDS);

  return verifyCacheRevalidationSignature({
    rawBody: RAW_BODY,
    timestampHeader,
    signatureHeader: sign(timestampHeader),
    secret: SECRET,
    nowSeconds: NOW_SECONDS,
    ...overrides,
  });
}

describe('verifyCacheRevalidationSignature', () => {
  it('accepts a real HMAC over the exact timestamp header and raw body', () => {
    expect(verify()).toBe(true);
  });

  it.each([-300, 300])('accepts a timestamp exactly %i seconds from now', (offset) => {
    const timestampHeader = String(NOW_SECONDS + offset);

    expect(
      verify({
        timestampHeader,
        signatureHeader: sign(timestampHeader),
      }),
    ).toBe(true);
  });

  it.each([-301, 301])('rejects a timestamp %i seconds from now', (offset) => {
    const timestampHeader = String(NOW_SECONDS + offset);

    expect(
      verify({
        timestampHeader,
        signatureHeader: sign(timestampHeader),
      }),
    ).toBe(false);
  });

  it.each([
    ['missing timestamp', { timestampHeader: null }],
    ['negative timestamp', { timestampHeader: '-1' }],
    ['decimal timestamp', { timestampHeader: '1785000000.5' }],
    ['unsafe timestamp', { timestampHeader: '999999999999999999999' }],
    ['missing signature', { signatureHeader: null }],
    ['signature without prefix', { signatureHeader: 'a'.repeat(64) }],
    ['uppercase signature', { signatureHeader: `sha256=${'A'.repeat(64)}` }],
    ['short signature', { signatureHeader: `sha256=${'a'.repeat(63)}` }],
  ] satisfies [string, Partial<Parameters<typeof verifyCacheRevalidationSignature>[0]>][])(
    'rejects a %s header',
    (_caseName, overrides) => {
      expect(verify(overrides)).toBe(false);
    },
  );

  it('rejects a different raw-body byte sequence', () => {
    expect(
      verify({
        rawBody: '{ "schemaVersion": 1 }',
      }),
    ).toBe(false);
  });
});
