import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';
import type { CatalogControlsModel } from '../model/types';
import { CatalogControls } from './catalog-controls';

const { push } = vi.hoisted(() => ({ push: vi.fn() }));

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push }),
}));

const MODEL: CatalogControlsModel = {
  search: 'spa',
  activeCategorySlug: 'night-life',
  categories: [
    {
      id: 'category_spa',
      slug: 'spa',
      title: 'SPA',
    },
    {
      id: 'category_night_life',
      slug: 'night-life',
      title: 'Ночная жизнь',
    },
  ],
};

describe('CatalogControls', () => {
  it('renders the search field and ordered category buttons without MUI markup', () => {
    const html = renderToStaticMarkup(
      createElement(CatalogControls, {
        model: MODEL,
        currentSearchParams: 'search=spa&category=night-life',
      }),
    );

    expect(html).toContain('aria-label="Фильтры каталога"');
    expect(html).toContain('data-slot="text-field"');
    expect(html).toContain('id="catalog-search"');
    expect(html).toContain('for="catalog-search"');
    expect(html).toContain('name="search"');
    expect(html).toContain('value="spa"');
    expect(html).toContain('placeholder="Название или описание места"');
    expect(html).toMatch(/maxlength="100"/i);
    expect(html).toContain('type="submit"');
    expect(html).toContain('>Найти</button>');
    expect(html).toContain('aria-pressed="true"');
    expect(html).toContain('bg-primary');
    expect(html).toContain('text-primary-foreground');
    expect(html).not.toContain('background-color:');
    expect(html.indexOf('>Все</button>')).toBeLessThan(html.indexOf('>SPA</button>'));
    expect(html.indexOf('>SPA</button>')).toBeLessThan(html.indexOf('>Ночная жизнь</button>'));
    expect(html.match(/<button\b/g)).toHaveLength(4);
    expect(html).not.toContain('Mui');
  });

  it('marks the All category as active when no category slug is applied', () => {
    const html = renderToStaticMarkup(
      createElement(CatalogControls, {
        model: {
          ...MODEL,
          activeCategorySlug: undefined,
        },
        currentSearchParams: 'search=spa',
      }),
    );

    expect(html).toMatch(/<button[^>]*aria-pressed="true"[^>]*>Все<\/button>/);
    expect(html.match(/aria-pressed="false"/g)).toHaveLength(2);
  });
});
