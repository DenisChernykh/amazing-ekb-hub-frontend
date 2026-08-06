const COLLECTION_SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/** Возвращает корректный public slug подборки или `null`. */
export function normalizeCollectionSlug(collectionSlug: string): string | null {
  return COLLECTION_SLUG_PATTERN.test(collectionSlug) ? collectionSlug : null;
}
