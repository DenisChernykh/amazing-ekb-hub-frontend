import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { PlacesCatalogEmpty } from './places-catalog-empty';

describe('PlacesCatalogEmpty', () => {
  it('renders generic empty catalog copy without reset action', () => {
    const html = renderToStaticMarkup(createElement(PlacesCatalogEmpty));

    expect(html).toContain('Каталог пока пуст');
    expect(html).toContain('Мы покажем места, когда они появятся в каталоге.');
    expect(html).not.toContain('Сбросить фильтры');
  });

  it('renders filtered empty copy with reset action', () => {
    const html = renderToStaticMarkup(
      createElement(PlacesCatalogEmpty, {
        kind: 'filtered',
        resetHref: '/?pageSize=40',
      }),
    );

    expect(html).toContain('Ничего не найдено');
    expect(html).toContain('Нет мест, которые подходят под текущий поиск или категорию.');
    expect(html).toContain('href="/?pageSize=40"');
    expect(html).toContain('Сбросить фильтры');
  });
});
