import { revalidateTag } from 'next/cache';
import { cacheRevalidationPayloadSchema } from './_lib/cache-revalidation-schema';
import { mapRevalidationScopesToTags } from './_lib/map-revalidation-scopes-to-tags';
import { verifyCacheRevalidationSignature } from './_lib/verify-cache-revalidation-signature';

export async function POST(request: Request): Promise<Response> {
  try {
    const secret = process.env.CACHE_REVALIDATION_SECRET;
    if (!secret || secret.length < 32) {
      return Response.json({ message: 'Cache revalidation is not configured.' }, { status: 500 });
    }

    const rawBody = await request.text();
    const verified = verifyCacheRevalidationSignature({
      rawBody,
      timestampHeader: request.headers.get('X-Amazing-Timestamp'),
      signatureHeader: request.headers.get('X-Amazing-Signature'),
      secret,
    });

    if (!verified) {
      return Response.json({ message: 'Invalid signature.' }, { status: 401 });
    }

    let json: unknown;
    try {
      json = JSON.parse(rawBody);
    } catch {
      return Response.json({ message: 'Invalid JSON body.' }, { status: 400 });
    }

    const payload = cacheRevalidationPayloadSchema.safeParse(json);
    if (!payload.success) {
      return Response.json({ message: 'Invalid revalidation body.' }, { status: 400 });
    }

    for (const tag of mapRevalidationScopesToTags(payload.data.scopes)) {
      revalidateTag(tag, { expire: 0 });
    }

    return new Response(null, { status: 204 });
  } catch {
    return Response.json({ message: 'Cache revalidation failed.' }, { status: 500 });
  }
}
