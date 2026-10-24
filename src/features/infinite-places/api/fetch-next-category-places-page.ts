import { categoryPlacesPageSchema, type CategoryPlacesPage } from '@/entities/place/client';

/** Загружает следующую страницу мест через same-origin Route Handler. */
export async function fetchNextCategoryPlacesPage({
  categorySlug,
  page,
  signal,
}: {
  categorySlug: string;
  page: number;
  signal: AbortSignal;
}): Promise<CategoryPlacesPage> {
  const response = await fetch(
    `/api/categories/${encodeURIComponent(categorySlug)}/places?page=${page}`,
    { signal },
  );

  if (!response.ok) {
    throw new Error(`Category places request failed with ${response.status}`);
  }

  return categoryPlacesPageSchema.parse(await response.json());
}
