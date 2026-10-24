import { fetchPublicCategories, mapCategoryToCardModel } from '@/entities/category';

const HOME_CATEGORY_LIMIT = 8;

/** Загружает и преобразует категории, показываемые на главной странице. */
export async function getHomePageData() {
  const categories = await fetchPublicCategories();
  return categories.slice(0, HOME_CATEGORY_LIMIT).map(mapCategoryToCardModel);
}
