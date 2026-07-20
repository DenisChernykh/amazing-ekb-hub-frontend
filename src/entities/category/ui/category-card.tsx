import Link from 'next/link';
import { buildCategoryHref } from '../lib/build-category-href';
import type { CategoryCardModel } from '../model/types';
import { CategoryCardImage } from './category-card-image';

/** Отображает ссылку-карточку публичной категории. */
export function CategoryCard({ category }: Readonly<{ category: CategoryCardModel }>) {
  return (
    <article className="h-full border border-border bg-white">
      <Link
        href={buildCategoryHref(category.slug)}
        className="group flex h-full flex-col text-black focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-black"
      >
        <CategoryCardImage image={category.image} />
        <h2 className="px-4 py-5 text-base font-medium transition-colors group-hover:text-card-title-hover group-focus-visible:text-card-title-hover sm:px-5 sm:text-lg">
          {category.title}
        </h2>
      </Link>
    </article>
  );
}
