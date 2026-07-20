/** Строит публичный URL категории с безопасно закодированным slug. */
export function buildCategoryHref(categorySlug: string): string {
  return `/categories/${encodeURIComponent(categorySlug)}`;
}
