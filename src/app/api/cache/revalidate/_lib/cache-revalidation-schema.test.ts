import { describe, expect, it } from 'vitest';
import { cacheRevalidationPayloadSchema } from './cache-revalidation-schema';

const VALID_PAYLOAD = {
  schemaVersion: 1,
  eventId: '0d088c43-4f7f-4c3b-b51f-1457cc9ef818',
  occurredAt: '2026-07-19T12:00:00.000Z',
  scopes: {
    categories: true,
    categorySlugs: ['old-slug', 'new-slug'],
    placeSlugs: ['old-place', 'new-place'],
  },
};

describe('cacheRevalidationPayloadSchema', () => {
  it('accepts the strict version 1 payload', () => {
    expect(cacheRevalidationPayloadSchema.safeParse(VALID_PAYLOAD).success).toBe(true);
  });

  it.each([
    ['unsupported schema version', { ...VALID_PAYLOAD, schemaVersion: 2 }],
    ['malformed UUID', { ...VALID_PAYLOAD, eventId: 'event-1' }],
    ['timestamp without an offset', { ...VALID_PAYLOAD, occurredAt: '2026-07-19T12:00:00.000' }],
    ['malformed category slug', { ...VALID_PAYLOAD, scopes: { categorySlugs: ['Invalid-Slug'] } }],
    ['malformed place slug', { ...VALID_PAYLOAD, scopes: { placeSlugs: ['bad_slug'] } }],
    ['empty scopes', { ...VALID_PAYLOAD, scopes: {} }],
    ['empty category slugs', { ...VALID_PAYLOAD, scopes: { categorySlugs: [] } }],
    ['empty place slugs', { ...VALID_PAYLOAD, scopes: { placeSlugs: [] } }],
    ['unknown root field', { ...VALID_PAYLOAD, deliveryAttempt: 1 }],
    [
      'unknown scope field',
      { ...VALID_PAYLOAD, scopes: { ...VALID_PAYLOAD.scopes, allPlaces: true } },
    ],
  ])('rejects %s', (_caseName, payload) => {
    expect(cacheRevalidationPayloadSchema.safeParse(payload).success).toBe(false);
  });
});
