export function buildCategoryHref(categorySlug: string): string {
  return `/categories/${encodeURIComponent(categorySlug)}`;
}
