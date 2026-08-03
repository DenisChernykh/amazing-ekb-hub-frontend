import type { CategoryCardModel } from '@/entities/category';
import { Container } from '@/shared/ui';
import { CategoryGrid } from '@/widgets/category-grid';
import { HomeHero } from './home-hero';

/** Отображает на главной первые категории и переход к полному каталогу. */
export function HomeCategorySection({ categories }: Readonly<{ categories: CategoryCardModel[] }>) {
  return (
    <main>
      <HomeHero />
      <Container className="py-10 sm:py-14 lg:py-16">
        <div className="mb-8 flex items-end justify-between gap-6">
          <h2 className="text-3xl font-medium text-black sm:text-4xl">Категории</h2>
        </div>
        <CategoryGrid categories={categories} ariaLabel="Категории мест" />
      </Container>
    </main>
  );
}
