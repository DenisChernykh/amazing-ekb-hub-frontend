import { fetchPublicCategories, mapCategoryToCardModel } from '@/entities/category';

export async function getCategoriesPageData() {
  const categories = await fetchPublicCategories();
  return categories.map(mapCategoryToCardModel);
}
