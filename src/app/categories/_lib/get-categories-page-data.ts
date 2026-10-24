import { fetchPublicCategories, mapCategoryToCardModel } from '@/entities/category';

/** Загружает и преобразует полный список публичных категорий. */
export async function getCategoriesPageData() {
  const categories = await fetchPublicCategories();
  return categories.map(mapCategoryToCardModel);
}
