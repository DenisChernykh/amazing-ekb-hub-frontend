import { Container } from '@/shared/ui';
import { CategoryGrid } from '@/widgets/category-grid';
import { getCategoriesPageData } from './_lib/get-categories-page-data';

/** Серверная страница полного списка категорий. */
export default async function CategoriesPage() {
  const categories = await getCategoriesPageData();

  return (
    <Container as="main" className="py-10 sm:py-14 lg:py-16">
      <h1 className="mb-8 text-3xl font-medium text-black sm:text-4xl">Все категории</h1>
      <CategoryGrid categories={categories} ariaLabel="Все категории мест" />
    </Container>
  );
}
