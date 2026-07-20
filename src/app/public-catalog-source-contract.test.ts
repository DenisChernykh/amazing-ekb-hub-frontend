import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const CATALOG_SOURCE_FILES = [
  'src/app/(home)/page.tsx',
  'src/app/(home)/_components/home-category-section.tsx',
  'src/app/(home)/_components/show-all-categories-link.tsx',
  'src/app/categories/page.tsx',
  'src/app/categories/[categorySlug]/page.tsx',
  'src/app/categories/[categorySlug]/loading.tsx',
  'src/app/categories/[categorySlug]/error.tsx',
  'src/app/categories/[categorySlug]/_components/category-page-content.tsx',
  'src/entities/category/ui/category-card.tsx',
  'src/entities/category/ui/category-card-image.tsx',
  'src/entities/place/ui/place-card.tsx',
  'src/entities/place/ui/place-card-image.tsx',
  'src/features/infinite-places/model/use-infinite-places.ts',
  'src/features/infinite-places/ui/places-append-control.tsx',
  'src/widgets/category-grid/ui/category-grid.tsx',
  'src/widgets/place-feed/ui/infinite-place-feed.tsx',
  'src/widgets/place-feed/ui/place-feed.tsx',
  'src/widgets/site-header/ui/site-header.tsx',
] as const;

describe('public catalog source contract', () => {
  it('contains no legacy query catalog slices', () => {
    expect(existsSync(resolve(process.cwd(), 'src/features/catalog-controls'))).toBe(false);
    expect(existsSync(resolve(process.cwd(), 'src/features/places-pagination'))).toBe(false);
    expect(existsSync(resolve(process.cwd(), 'src/widgets/places-catalog'))).toBe(false);
  });

  it('adds no arbitrary Tailwind bracket utilities to the catalog source', () => {
    const arbitraryUtility = /(?:^|\s)[^\s"'`]*-\[[^\]]+\]/m;

    for (const path of CATALOG_SOURCE_FILES) {
      const source = readFileSync(resolve(process.cwd(), path), 'utf8');
      expect(source, path).not.toMatch(arbitraryUtility);
    }
  });
});
