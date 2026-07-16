import { PlaceCard } from '@/entities/place';
import { CatalogControls } from '@/features/catalog-controls';
import { PlacesPagination } from '@/features/places-pagination';
import { Container } from '@/shared/ui';
import { getPlacesCatalogEmptyState } from '../model/get-places-catalog-empty-state';
import type { PlacesCatalogModel } from '../model/types';
import { PlacesCatalogEmpty } from './places-catalog-empty';

interface PlacesCatalogProps {
  model: PlacesCatalogModel;
}

/**
 * Собирает рабочий каталог мест: заголовок, сетку карточек и пагинацию.
 *
 * @param props - Модель каталога мест.
 */
export function PlacesCatalog({ model }: Readonly<PlacesCatalogProps>) {
  const { results, controls, pagination, links, navigation } = model;
  const hasActiveFilters = Boolean(controls.search || controls.activeCategorySlug);
  const emptyState = getPlacesCatalogEmptyState({
    hasActiveFilters,
    total: results.total,
    resetHref: links.resetFilters,
    firstPageHref: links.firstPage,
  });

  return (
    <Container as="main" className="pt-[30px] pb-16 min-[600px]:pt-12">
      <header className="mb-7 flex flex-col items-start justify-between gap-[18px] min-[600px]:flex-row min-[600px]:items-end">
        <div className="flex flex-col gap-2.5">
          <h1 className="text-[clamp(2rem,1.4rem+2vw,3.4rem)] leading-[1.04] font-bold tracking-normal text-foreground">
            Места
          </h1>
          <p className="leading-[1.55] text-muted-foreground">Найдено: {results.total}</p>
        </div>

        <p className="leading-[1.55] whitespace-nowrap text-muted-foreground min-[600px]:mb-1.5">
          Страница {pagination.page} из {pagination.pageCount}
        </p>
      </header>

      <CatalogControls model={controls} currentSearchParams={navigation.currentSearchParams} />

      {results.items.length > 0 ? (
        <section
          aria-label="Список мест"
          className="grid grid-cols-1 gap-4 min-[600px]:gap-5 min-[900px]:grid-cols-2 min-[1200px]:grid-cols-3"
        >
          {results.items.map((place) => (
            <PlaceCard key={place.id} place={place} />
          ))}
        </section>
      ) : (
        <PlacesCatalogEmpty {...emptyState} />
      )}

      <PlacesPagination
        pagination={pagination}
        currentSearchParams={navigation.currentSearchParams}
      />
    </Container>
  );
}
