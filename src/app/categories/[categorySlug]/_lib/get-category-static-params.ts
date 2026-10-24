import { fetchPublicCategories } from '@/entities/category';

/** Возвращает slug категорий, которые Next.js может подготовить во время сборки. */
export async function getCategoryStaticParams() {
  const categories = await fetchPublicCategories();
  return categories.map(({ slug: categorySlug }) => ({ categorySlug }));
}
