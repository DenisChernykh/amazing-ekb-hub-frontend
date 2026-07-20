import type { CategoryCardModel } from '@/entities/category';
import { Container } from '@/shared/ui';
import { CategoryGrid } from '@/widgets/category-grid';
import { ShowAllCategoriesLink } from './show-all-categories-link';

export function HomeCategorySection({ categories }: Readonly<{ categories: CategoryCardModel[] }>) {
  return (
    <Container as="main" className="py-10 sm:py-14 lg:py-16">
      <div className="mb-8 flex items-end justify-between gap-6">
        <h1 className="text-3xl font-medium text-black sm:text-4xl">Категории</h1>
      </div>
      <CategoryGrid categories={categories} ariaLabel="Категории мест" />
      <div className="mt-8 flex justify-center sm:mt-10">
        <ShowAllCategoriesLink />
      </div>
    </Container>
  );
}
