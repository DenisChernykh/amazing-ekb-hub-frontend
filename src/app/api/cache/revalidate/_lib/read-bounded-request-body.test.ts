import { describe, expect, it } from 'vitest';
import {
  MAX_CACHE_REVALIDATION_BODY_BYTES,
  readBoundedRequestBody,
} from './read-bounded-request-body';

const ENCODER = new TextEncoder();

function createStreamedRequest(chunks: Uint8Array[], contentLength?: string) {
  const headers = new Headers();
  if (contentLength !== undefined) headers.set('Content-Length', contentLength);

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

describe('readBoundedRequestBody', () => {
  it('rejects a declared Content-Length above the webhook limit', async () => {
    const request = new Request('http://localhost/api/cache/revalidate', {
      method: 'POST',
      headers: {
        'Content-Length': String(MAX_CACHE_REVALIDATION_BODY_BYTES + 1),
      },
      body: '{}',
    });

    await expect(readBoundedRequestBody(request)).resolves.toEqual({ ok: false });
  });

  it('rejects a chunked body when actual bytes exceed the webhook limit', async () => {
    const firstChunk = new Uint8Array(MAX_CACHE_REVALIDATION_BODY_BYTES / 2);
    const secondChunk = new Uint8Array(MAX_CACHE_REVALIDATION_BODY_BYTES / 2);
    const overflowChunk = ENCODER.encode('x');

    await expect(
      readBoundedRequestBody(createStreamedRequest([firstChunk, secondChunk, overflowChunk])),
    ).resolves.toEqual({ ok: false });
  });

  it('accepts actual bytes exactly at the webhook limit', async () => {
    const body = new Uint8Array(MAX_CACHE_REVALIDATION_BODY_BYTES);

    const result = await readBoundedRequestBody(createStreamedRequest([body]));

    expect(result.ok).toBe(true);
    if (result.ok) expect(result.body).toHaveLength(MAX_CACHE_REVALIDATION_BODY_BYTES);
  });

  it('does not trust a malformed Content-Length and still bounds actual bytes', async () => {
    const overLimitBody = new Uint8Array(MAX_CACHE_REVALIDATION_BODY_BYTES + 1);

    await expect(
      readBoundedRequestBody(createStreamedRequest([overLimitBody], 'not-a-number')),
    ).resolves.toEqual({ ok: false });
  });
});
