import { fetchPublicCategories } from '@/entities/category';

export async function getCategoryStaticParams() {
  const categories = await fetchPublicCategories();
  return categories.map(({ slug: categorySlug }) => ({ categorySlug }));
}
