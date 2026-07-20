import { revalidateTag } from 'next/cache';
import { createHmac } from 'node:crypto';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { POST } from './route';

vi.mock('next/cache', () => ({
  revalidateTag: vi.fn(),
}));

const NOW_SECONDS = 1_784_467_200;
const SECRET = '0123456789abcdef0123456789abcdef';
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

function sign(rawBody: string, timestampHeader: string, secret = SECRET) {
  return `sha256=${createHmac('sha256', secret)
    .update(`${timestampHeader}.${rawBody}`, 'utf8')
    .digest('hex')}`;
}

function createSignedRequest({
  rawBody = RAW_BODY,
  timestampHeader = String(NOW_SECONDS),
  signatureHeader = sign(rawBody, timestampHeader),
}: {
  rawBody?: string;
  timestampHeader?: string;
  signatureHeader?: string;
} = {}) {
  return new Request('http://localhost/api/cache/revalidate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Amazing-Signature': signatureHeader,
      'X-Amazing-Timestamp': timestampHeader,
    },
    body: rawBody,
  });
}

describe('POST cache revalidation', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(NOW_SECONDS * 1000);
    vi.stubEnv('CACHE_REVALIDATION_SECRET', SECRET);
    revalidateTagMock.mockReset();
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
});
