import { createHmac } from 'node:crypto';
import { describe, expect, it } from 'vitest';
import { verifyCacheRevalidationSignature } from './verify-cache-revalidation-signature';

const SECRET = 'a-secure-cache-revalidation-secret';
const NOW_SECONDS = 1_785_000_000;
const ENCODER = new TextEncoder();
const RAW_BODY = ENCODER.encode('{"schemaVersion":1}');

function sign(timestampHeader: string, rawBody: Uint8Array = RAW_BODY) {
  return `sha256=${createHmac('sha256', SECRET)
    .update(timestampHeader, 'utf8')
    .update('.', 'ascii')
    .update(rawBody)
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
  it('accepts a real HMAC over the exact timestamp header and raw body bytes', () => {
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
        rawBody: ENCODER.encode('{ "schemaVersion": 1 }'),
      }),
    ).toBe(false);
  });

  it('rejects BOM-prefixed bytes signed only over the canonical JSON bytes', () => {
    const bomBody = Uint8Array.from([0xef, 0xbb, 0xbf, ...RAW_BODY]);

    expect(
      verify({
        rawBody: bomBody,
      }),
    ).toBe(false);
  });

  it('accepts BOM-prefixed bytes when the BOM is included in the HMAC input', () => {
    const bomBody = Uint8Array.from([0xef, 0xbb, 0xbf, ...RAW_BODY]);
    const timestampHeader = String(NOW_SECONDS);

    expect(
      verify({
        rawBody: bomBody,
        signatureHeader: sign(timestampHeader, bomBody),
      }),
    ).toBe(true);
  });
});
