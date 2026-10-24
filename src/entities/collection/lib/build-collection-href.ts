/** Строит безопасный публичный URL подборки с encoded slug-сегментом. */
export function buildCollectionHref(collectionSlug: string): string {
  return `/collections/${encodeURIComponent(collectionSlug)}`;
}
