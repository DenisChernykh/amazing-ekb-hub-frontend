import { CategoryCard, type CategoryCardModel } from '@/entities/category';

export function CategoryGrid({
  categories,
  ariaLabel,
}: Readonly<{ categories: CategoryCardModel[]; ariaLabel: string }>) {
  return (
    <section aria-label={ariaLabel}>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4 lg:gap-5">
        {categories.map((category) => (
          <CategoryCard key={category.id} category={category} />
        ))}
      </div>
    </section>
  );
}
