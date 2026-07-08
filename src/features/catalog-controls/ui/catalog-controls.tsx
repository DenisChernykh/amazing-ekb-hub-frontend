'use client';

import { getPlaceCategoryDisplay, type PlaceCategory } from '@/entities/place';
import { Button, Chip, Stack, TextField, Typography } from '@mui/material';
import { useRouter, useSearchParams } from 'next/navigation';
import type { FormEvent } from 'react';
import { buildCatalogControlsHref } from '../lib/build-catalog-controls-href';
import { buildCatalogControlsInputKey } from '../lib/build-catalog-controls-input-key';

interface CatalogControlsProps {
  search?: string;
  activeCategorySlug?: string;
  categories: PlaceCategory[];
}

/**
 * Рендерит URL-driven controls публичного каталога мест.
 *
 * @param props - Активные фильтры из нормализованного server-side query.
 */
export function CatalogControls({
  search,
  activeCategorySlug,
  categories,
}: Readonly<CatalogControlsProps>) {
  const router = useRouter();
  const searchParams = useSearchParams();

  /**
   * Это хелпер. Навигирует каталог к следующему URL-состоянию controls.
   *
   * @param next - Следующее состояние поиска или категории.
   */
  function navigate(next: Parameters<typeof buildCatalogControlsHref>[0]['next']) {
    router.push(
      buildCatalogControlsHref({
        currentSearchParams: searchParams.toString(),
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
    <Stack component="section" aria-label="Фильтры каталога" spacing={2.25} mb={3.5}>
      <Stack
        component="form"
        onSubmit={handleSearchSubmit}
        direction={{ xs: 'column', sm: 'row' }}
        spacing={1.25}
        alignItems={{ xs: 'stretch', sm: 'flex-start' }}
      >
        <TextField
          key={buildCatalogControlsInputKey({ search, category: activeCategorySlug })}
          fullWidth
          defaultValue={search ?? ''}
          label="Поиск"
          name="search"
          slotProps={{ htmlInput: { maxLength: 100 } }}
          placeholder="Название или описание места"
          size="small"
        />
        <Button type="submit" variant="contained" sx={{ minWidth: { sm: 128 } }}>
          Найти
        </Button>
      </Stack>

      <Stack spacing={1}>
        <Typography color="text.secondary" component="h2" variant="subtitle2">
          Категории
        </Typography>
        <Stack direction="row" flexWrap="wrap" gap={1}>
          <Chip
            color={activeCategorySlug ? 'default' : 'primary'}
            label="Все"
            onClick={() => navigate({ category: null })}
            variant={activeCategorySlug ? 'outlined' : 'filled'}
          />

          {categories.map((placeCategory) => {
            const display = getPlaceCategoryDisplay(placeCategory);
            const isActive = activeCategorySlug === placeCategory.slug;

            return (
              <Chip
                key={placeCategory.id}
                color={isActive ? 'primary' : 'default'}
                label={display.label}
                onClick={() => navigate({ category: placeCategory.slug })}
                sx={
                  isActive
                    ? {
                        bgcolor: display.backgroundColor,
                        color: display.color,
                        fontWeight: 700,
                      }
                    : undefined
                }
                variant={isActive ? 'filled' : 'outlined'}
              />
            );
          })}
        </Stack>
      </Stack>
    </Stack>
  );
}
