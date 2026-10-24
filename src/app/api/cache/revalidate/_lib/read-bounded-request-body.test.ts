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

function createCancellableRequest({
  chunks,
  cancel,
}: {
  chunks: Uint8Array[];
  cancel: () => void | Promise<void>;
}) {
  let chunkIndex = 0;

  return new Request('http://localhost/api/cache/revalidate', {
    method: 'POST',
    body: new ReadableStream<Uint8Array>({
      pull(controller) {
        const chunk = chunks[chunkIndex];
        if (!chunk) return;

        chunkIndex += 1;
        controller.enqueue(chunk);
      },
      cancel,
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

  it('cancels the request stream when actual chunks exceed the limit', async () => {
    let cancelCalls = 0;
    const request = createCancellableRequest({
      chunks: [
        new Uint8Array(MAX_CACHE_REVALIDATION_BODY_BYTES / 2),
        new Uint8Array(MAX_CACHE_REVALIDATION_BODY_BYTES / 2 + 1),
      ],
      cancel() {
        cancelCalls += 1;
      },
    });

    await expect(readBoundedRequestBody(request)).resolves.toEqual({ ok: false });
    expect(cancelCalls).toBe(1);
  });

  it('keeps known overflow as too large when stream cancellation rejects', async () => {
    const request = createCancellableRequest({
      chunks: [new Uint8Array(MAX_CACHE_REVALIDATION_BODY_BYTES + 1)],
      cancel() {
        return Promise.reject(new Error('cancel failed'));
      },
    });

    await expect(readBoundedRequestBody(request)).resolves.toEqual({ ok: false });
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

  it('does not trust a lower numeric Content-Length and still bounds actual bytes', async () => {
    const overLimitBody = new Uint8Array(MAX_CACHE_REVALIDATION_BODY_BYTES + 1);

    await expect(
      readBoundedRequestBody(createStreamedRequest([overLimitBody], '1')),
    ).resolves.toEqual({ ok: false });
  });

  it('propagates a technical reader failure instead of classifying it as overflow', async () => {
    const streamError = new Error('request stream failed');
    const request = new Request('http://localhost/api/cache/revalidate', {
      method: 'POST',
      body: new ReadableStream<Uint8Array>({
        pull(controller) {
          controller.error(streamError);
        },
      }),
      duplex: 'half',
    } as RequestInit & { duplex: 'half' });

    await expect(readBoundedRequestBody(request)).rejects.toBe(streamError);
  });
});
