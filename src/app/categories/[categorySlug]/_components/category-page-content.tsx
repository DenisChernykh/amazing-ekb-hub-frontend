import type { CategoryCardModel } from '@/entities/category';
import type { CategoryPlacesPage } from '@/entities/place';
import { Container } from '@/shared/ui';
import { InfinitePlaceFeed } from '@/widgets/place-feed';
import Link from 'next/link';

export function CategoryPageContent({
  category,
  places,
}: Readonly<{ category: CategoryCardModel; places: CategoryPlacesPage }>) {
  return (
    <Container as="main" className="py-8 sm:py-12 lg:py-14">
      <nav aria-label="Хлебные крошки" className="mb-6 text-sm text-muted-foreground">
        <ol className="flex flex-wrap items-center gap-2">
          <li>
            <Link
              href="/"
              className="hover:text-black focus-visible:outline-2 focus-visible:outline-black"
            >
              Главная
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li>
            <Link
              href="/categories"
              className="hover:text-black focus-visible:outline-2 focus-visible:outline-black"
            >
              Категории
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li aria-current="page" className="text-black">
            {category.title}
          </li>
        </ol>
      </nav>

      <h1 className="mb-8 text-3xl font-medium text-black sm:text-4xl">{category.title}</h1>

      {places.items.length > 0 ? (
        <InfinitePlaceFeed initialPage={places} categorySlug={category.slug} />
      ) : (
        <p className="py-12 text-base text-muted-foreground">В этой категории пока нет мест.</p>
      )}
    </Container>
  );
}
