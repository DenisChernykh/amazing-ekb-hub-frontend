import { revalidateTag } from 'next/cache';
import { createHmac } from 'node:crypto';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { MAX_CACHE_REVALIDATION_BODY_BYTES } from './_lib/read-bounded-request-body';
import { verifyCacheRevalidationSignature } from './_lib/verify-cache-revalidation-signature';
import { POST } from './route';

vi.mock('next/cache', () => ({
  revalidateTag: vi.fn(),
}));

vi.mock('./_lib/verify-cache-revalidation-signature', async (importOriginal) => {
  const original =
    await importOriginal<typeof import('./_lib/verify-cache-revalidation-signature')>();

  return {
    ...original,
    verifyCacheRevalidationSignature: vi.fn(original.verifyCacheRevalidationSignature),
  };
});

const NOW_SECONDS = 1_784_467_200;
const SECRET = '0123456789abcdef0123456789abcdef';
const ENCODER = new TextEncoder();
const VALID_PAYLOAD = {
  schemaVersion: 1,
  eventId: '0d088c43-4f7f-4c3b-b51f-1457cc9ef818',
  occurredAt: '2026-07-19T12:00:00.000Z',
  scopes: {
    categories: true,
    categorySlugs: ['old-slug', 'old-slug', 'new-slug'],
    placeSlugs: ['old-place', 'old-place', 'new-place'],
  },
};
const RAW_BODY = JSON.stringify(VALID_PAYLOAD);
const EXPECTED_TAGS = [
  'categories',
  'category:old-slug',
  'category-places:old-slug',
  'category:new-slug',
  'category-places:new-slug',
  'place:old-place',
  'place:new-place',
];

const revalidateTagMock = vi.mocked(revalidateTag);
const verifyCacheRevalidationSignatureMock = vi.mocked(verifyCacheRevalidationSignature);

function toBytes(rawBody: string | Uint8Array) {
  return typeof rawBody === 'string' ? ENCODER.encode(rawBody) : rawBody;
}

function sign(rawBody: string | Uint8Array, timestampHeader: string, secret = SECRET) {
  return `sha256=${createHmac('sha256', secret)
    .update(timestampHeader, 'utf8')
    .update('.', 'ascii')
    .update(toBytes(rawBody))
    .digest('hex')}`;
}

function createSignedRequest({
  rawBody = RAW_BODY,
  timestampHeader = String(NOW_SECONDS),
  signatureHeader = sign(rawBody, timestampHeader),
  headers = {},
}: {
  rawBody?: string | Uint8Array;
  timestampHeader?: string;
  signatureHeader?: string;
  headers?: HeadersInit;
} = {}) {
  return new Request('http://localhost/api/cache/revalidate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Amazing-Signature': signatureHeader,
      'X-Amazing-Timestamp': timestampHeader,
      ...headers,
    },
    body: typeof rawBody === 'string' ? rawBody : Uint8Array.from(rawBody).buffer,
  });
}

function createStreamedRequest(chunks: Uint8Array[], headers: HeadersInit = {}) {
  return new Request('http://localhost/api/cache/revalidate', {
    method: 'POST',
    headers,
    body: new ReadableStream<Uint8Array>({
      start(controller) {
        for (const chunk of chunks) controller.enqueue(chunk);
        controller.close();
      },
    }),
    duplex: 'half',
  } as RequestInit & { duplex: 'half' });
}

describe('POST cache revalidation', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(NOW_SECONDS * 1000);
    vi.stubEnv('CACHE_REVALIDATION_SECRET', SECRET);
    revalidateTagMock.mockReset();
    verifyCacheRevalidationSignatureMock.mockClear();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it('returns 204 and immediately expires each unique mapped tag once', async () => {
    const response = await POST(createSignedRequest());

    expect(response.status).toBe(204);
    expect(await response.text()).toBe('');
    expect(revalidateTagMock).toHaveBeenCalledTimes(EXPECTED_TAGS.length);
    expect(revalidateTagMock.mock.calls).toEqual(EXPECTED_TAGS.map((tag) => [tag, { expire: 0 }]));
  });

  it('treats a duplicate valid delivery as another harmless 204', async () => {
    const firstResponse = await POST(createSignedRequest());
    const secondResponse = await POST(createSignedRequest());

    expect(firstResponse.status).toBe(204);
    expect(secondResponse.status).toBe(204);
    expect(revalidateTagMock).toHaveBeenCalledTimes(EXPECTED_TAGS.length * 2);
    for (const tag of EXPECTED_TAGS) {
      expect(revalidateTagMock).toHaveBeenCalledWith(tag, { expire: 0 });
    }
  });

  it.each([
    ['invalid signature', { signatureHeader: `sha256=${'0'.repeat(64)}` }],
    [
      'timestamp outside the replay window',
      {
        timestampHeader: String(NOW_SECONDS - 301),
        signatureHeader: sign(RAW_BODY, String(NOW_SECONDS - 301)),
      },
    ],
    ['malformed timestamp', { timestampHeader: 'not-a-timestamp', signatureHeader: 'invalid' }],
  ])('returns 401 for %s without invalidating', async (_caseName, requestOptions) => {
    const response = await POST(createSignedRequest(requestOptions));

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toEqual({ message: 'Invalid signature.' });
    expect(revalidateTagMock).not.toHaveBeenCalled();
  });

  it('returns 401 when signature headers are missing', async () => {
    const response = await POST(
      new Request('http://localhost/api/cache/revalidate', {
        method: 'POST',
        body: RAW_BODY,
      }),
    );

    expect(response.status).toBe(401);
    expect(revalidateTagMock).not.toHaveBeenCalled();
  });

  it('verifies the exact raw-body bytes before parsing JSON', async () => {
    const signedBody = JSON.stringify(VALID_PAYLOAD);
    const sentBody = JSON.stringify(VALID_PAYLOAD, null, 2);
    const timestampHeader = String(NOW_SECONDS);
    const response = await POST(
      createSignedRequest({
        rawBody: sentBody,
        signatureHeader: sign(signedBody, timestampHeader),
      }),
    );

    expect(response.status).toBe(401);
    expect(revalidateTagMock).not.toHaveBeenCalled();
  });

  it('rejects BOM-prefixed bytes signed only over the canonical JSON bytes', async () => {
    const bomBody = Uint8Array.from([0xef, 0xbb, 0xbf, ...ENCODER.encode(RAW_BODY)]);
    const timestampHeader = String(NOW_SECONDS);
    const response = await POST(
      createSignedRequest({
        rawBody: bomBody,
        signatureHeader: sign(RAW_BODY, timestampHeader),
      }),
    );

    expect(response.status).toBe(401);
    expect(revalidateTagMock).not.toHaveBeenCalled();
  });

  it('authenticates exact BOM-prefixed bytes and decodes the JSON deterministically', async () => {
    const bomBody = Uint8Array.from([0xef, 0xbb, 0xbf, ...ENCODER.encode(RAW_BODY)]);
    const response = await POST(createSignedRequest({ rawBody: bomBody }));

    expect(response.status).toBe(204);
    expect(revalidateTagMock).toHaveBeenCalledTimes(EXPECTED_TAGS.length);
  });

  it('returns 413 from Content-Length before authentication without leaking credentials', async () => {
    const timestampHeader = String(NOW_SECONDS);
    const signature = sign(RAW_BODY, timestampHeader);
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const response = await POST(
      createSignedRequest({
        signatureHeader: signature,
        headers: {
          'Content-Length': String(MAX_CACHE_REVALIDATION_BODY_BYTES + 1),
        },
      }),
    );
    const responseBody = await response.text();
    const loggedOutput = JSON.stringify(consoleErrorSpy.mock.calls);

    expect(response.status).toBe(413);
    expect(verifyCacheRevalidationSignatureMock).not.toHaveBeenCalled();
    expect(revalidateTagMock).not.toHaveBeenCalled();
    expect(responseBody).not.toContain(SECRET);
    expect(responseBody).not.toContain(signature);
    expect(loggedOutput).not.toContain(SECRET);
    expect(loggedOutput).not.toContain(signature);
  });

  it('returns 413 when chunked actual bytes exceed the limit without Content-Length', async () => {
    const halfLimit = new Uint8Array(MAX_CACHE_REVALIDATION_BODY_BYTES / 2);
    const request = createStreamedRequest([halfLimit, halfLimit, new Uint8Array([0x00])]);

    const response = await POST(request);

    expect(response.status).toBe(413);
    expect(verifyCacheRevalidationSignatureMock).not.toHaveBeenCalled();
    expect(revalidateTagMock).not.toHaveBeenCalled();
  });

  it('returns 413 when a dishonest lower Content-Length understates actual bytes', async () => {
    const request = createStreamedRequest([new Uint8Array(MAX_CACHE_REVALIDATION_BODY_BYTES + 1)], {
      'Content-Length': '1',
    });

    const response = await POST(request);

    expect(response.status).toBe(413);
    expect(verifyCacheRevalidationSignatureMock).not.toHaveBeenCalled();
    expect(revalidateTagMock).not.toHaveBeenCalled();
  });

  it('accepts a valid signed body exactly at the byte limit', async () => {
    const padding = ' '.repeat(MAX_CACHE_REVALIDATION_BODY_BYTES - ENCODER.encode(RAW_BODY).length);
    const atLimitBody = `${RAW_BODY}${padding}`;

    expect(ENCODER.encode(atLimitBody)).toHaveLength(MAX_CACHE_REVALIDATION_BODY_BYTES);

    const response = await POST(createSignedRequest({ rawBody: atLimitBody }));

    expect(response.status).toBe(204);
    expect(revalidateTagMock).toHaveBeenCalledTimes(EXPECTED_TAGS.length);
  });

  it('returns 500 when reading the request stream fails technically', async () => {
    const request = new Request('http://localhost/api/cache/revalidate', {
      method: 'POST',
      body: new ReadableStream<Uint8Array>({
        pull(controller) {
          controller.error(new Error('request stream failed'));
        },
      }),
      duplex: 'half',
    } as RequestInit & { duplex: 'half' });

    const response = await POST(request);

    expect(response.status).toBe(500);
    await expect(response.json()).resolves.toEqual({
      message: 'Cache revalidation failed.',
    });
    expect(verifyCacheRevalidationSignatureMock).not.toHaveBeenCalled();
    expect(revalidateTagMock).not.toHaveBeenCalled();
  });

  it('returns 400 for signed exact invalid UTF-8 bytes', async () => {
    const invalidUtf8Body = Uint8Array.from([0xc3, 0x28]);

    const response = await POST(createSignedRequest({ rawBody: invalidUtf8Body }));

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      message: 'Invalid JSON body.',
    });
    expect(revalidateTagMock).not.toHaveBeenCalled();
  });

  it.each([
    ['invalid JSON', '{'],
    [
      'schema-invalid JSON',
      JSON.stringify({
        ...VALID_PAYLOAD,
        schemaVersion: 2,
      }),
    ],
  ])('returns 400 for a valid signature with %s', async (_caseName, rawBody) => {
    const response = await POST(createSignedRequest({ rawBody }));

    expect(response.status).toBe(400);
    expect(revalidateTagMock).not.toHaveBeenCalled();
  });

  it.each([
    ['missing', undefined],
    ['short', 'short-secret'],
  ])('returns 500 when the shared secret is %s', async (_caseName, secret) => {
    vi.stubEnv('CACHE_REVALIDATION_SECRET', secret);

    const response = await POST(createSignedRequest());

    expect(response.status).toBe(500);
    await expect(response.json()).resolves.toEqual({
      message: 'Cache revalidation is not configured.',
    });
    expect(revalidateTagMock).not.toHaveBeenCalled();
  });

  it('returns a safe 500 when tag invalidation throws', async () => {
    const signature = sign(RAW_BODY, String(NOW_SECONDS));
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    revalidateTagMock.mockImplementationOnce(() => {
      throw new Error(`internal ${SECRET} ${signature}`);
    });

    const response = await POST(createSignedRequest({ signatureHeader: signature }));
    const responseBody = await response.text();
    const loggedOutput = JSON.stringify(consoleErrorSpy.mock.calls);

    expect(response.status).toBe(500);
    expect(responseBody).toBe('{"message":"Cache revalidation failed."}');
    expect(responseBody).not.toContain(SECRET);
    expect(responseBody).not.toContain(signature);
    expect(loggedOutput).not.toContain(SECRET);
    expect(loggedOutput).not.toContain(signature);
  });

  it('retries every tag harmlessly after a partial invalidation failure', async () => {
    revalidateTagMock
      .mockImplementationOnce(() => undefined)
      .mockImplementationOnce(() => {
        throw new Error('temporary invalidation failure');
      });

    const failedResponse = await POST(createSignedRequest());
    const retryResponse = await POST(createSignedRequest());

    expect(failedResponse.status).toBe(500);
    expect(retryResponse.status).toBe(204);
    expect(revalidateTagMock.mock.calls).toEqual([
      [EXPECTED_TAGS[0], { expire: 0 }],
      [EXPECTED_TAGS[1], { expire: 0 }],
      ...EXPECTED_TAGS.map((tag) => [tag, { expire: 0 }]),
    ]);
  });
});
