/** Maximum signed cache-revalidation webhook body size: 64 KiB. */
export const MAX_CACHE_REVALIDATION_BODY_BYTES = 64 * 1024;

type ReadBoundedRequestBodyResult = { ok: true; body: Uint8Array } | { ok: false };

function declaredBodyExceedsLimit(contentLength: string | null): boolean {
  if (!/^\d+$/.test(contentLength ?? '')) return false;

  const declaredBytes = Number(contentLength);
  return Number.isSafeInteger(declaredBytes) && declaredBytes > MAX_CACHE_REVALIDATION_BODY_BYTES;
}

export async function readBoundedRequestBody(
  request: Request,
): Promise<ReadBoundedRequestBodyResult> {
  if (declaredBodyExceedsLimit(request.headers.get('Content-Length'))) {
    return { ok: false };
  }

  if (!request.body) return { ok: true, body: new Uint8Array() };

  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let totalBytes = 0;

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      totalBytes += value.byteLength;
      if (totalBytes > MAX_CACHE_REVALIDATION_BODY_BYTES) {
        await reader.cancel().catch(() => undefined);
        return { ok: false };
      }

      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }

  const body = new Uint8Array(totalBytes);
  let offset = 0;
  for (const chunk of chunks) {
    body.set(chunk, offset);
    offset += chunk.byteLength;
  }

  return { ok: true, body };
}
