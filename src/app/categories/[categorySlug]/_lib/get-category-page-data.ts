import {
  fetchPublicCategory,
  mapCategoryToCardModel,
  normalizeCategorySlug,
} from '@/entities/category';
import { fetchPublicCategoryPlacePage } from '@/entities/place';

/**
 * Собирает данные первого server-rendered экрана категории.
 *
 * Кеширование остаётся в entity-адаптерах: отдельный составной cache entry здесь не создаётся.
 */
export async function getCategoryPageData(rawSlug: string) {
  const categorySlug = normalizeCategorySlug(rawSlug);
  if (!categorySlug) return { kind: 'not_found' as const };

  const category = await fetchPublicCategory(categorySlug);
  if (!category) return { kind: 'not_found' as const };

  const places = await fetchPublicCategoryPlacePage({
    categoryId: category.id,
    categorySlug,
    page: 1,
  });

  return {
    kind: 'ready' as const,
    category: mapCategoryToCardModel(category),
    places,
  };
}
