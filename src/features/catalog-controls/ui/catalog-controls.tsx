'use client';

import { Button, TextField } from '@/shared/ui';
import { useRouter } from 'next/navigation';
import type { FormEvent } from 'react';
import { buildCatalogControlsHref } from '../lib/build-catalog-controls-href';
import { buildCatalogControlsInputKey } from '../lib/build-catalog-controls-input-key';
import type { CatalogControlsModel } from '../model/types';
import { CatalogCategoryFilters } from './catalog-category-filters';

interface CatalogControlsProps {
  model: CatalogControlsModel;
  currentSearchParams: string;
}

/**
 * Рендерит URL-driven controls публичного каталога мест.
 *
 * @param props - Модель controls из server-side каталога.
 */
export function CatalogControls({ model, currentSearchParams }: Readonly<CatalogControlsProps>) {
  const { search, activeCategorySlug, categories } = model;
  const router = useRouter();

  /**
   * Это хелпер. Навигирует каталог к следующему URL-состоянию controls.
   *
   * @param next - Следующее состояние поиска или категории.
   */
  function navigate(next: Parameters<typeof buildCatalogControlsHref>[0]['next']) {
    router.push(
      buildCatalogControlsHref({
        currentSearchParams,
        next,
      }),
    );
  }

  /**
   * Это хелпер. Применяет поисковую строку только по submit.
   *
   * @param event - Browser submit event формы поиска.
   */
  function handleSearchSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const nextSearch = String(formData.get('search') ?? '');

    navigate({ search: nextSearch });
  }

  return (
    <section aria-label="Фильтры каталога" className="mb-7 flex flex-col gap-[18px]">
      <form
        className="flex flex-col items-stretch gap-2.5 min-[600px]:flex-row min-[600px]:items-start"
        onSubmit={handleSearchSubmit}
      >
        <TextField
          key={buildCatalogControlsInputKey({ search, category: activeCategorySlug })}
          containerClassName="min-w-0 flex-1"
          defaultValue={search ?? ''}
          id="catalog-search"
          label="Поиск"
          maxLength={100}
          name="search"
          placeholder="Название или описание места"
        />
        <Button className="h-10 w-full min-[600px]:w-auto min-[600px]:min-w-32" type="submit">
          Найти
        </Button>
      </form>

      <div className="flex flex-col gap-2">
        <h2 className="text-sm leading-[1.55] font-medium text-muted-foreground">Категории</h2>
        <CatalogCategoryFilters
          activeCategorySlug={activeCategorySlug}
          categories={categories}
          onCategoryChange={(category) => navigate({ category })}
        />
      </div>
    </section>
  );
}
