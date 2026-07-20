const CATEGORY_SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function normalizeCategorySlug(categorySlug: string): string | null {
  return CATEGORY_SLUG_PATTERN.test(categorySlug) ? categorySlug : null;
}
