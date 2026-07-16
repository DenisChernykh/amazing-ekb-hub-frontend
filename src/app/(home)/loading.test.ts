import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import HomeLoading from './loading';

describe('HomeLoading', () => {
  it('renders the catalog-shaped loading skeleton for the home route', () => {
    const html = renderToStaticMarkup(createElement(HomeLoading));

    expect(html).toContain('aria-busy="true"');
    expect(html).toContain('aria-label="Загрузка каталога"');
    expect(html).toContain('data-slot="container"');
    expect(html).toContain('data-slot="skeleton"');
    expect(html.match(/<article/g) ?? []).toHaveLength(6);
    expect(html).toContain('Загрузка...');
    expect(html).toContain('sr-only');
    expect(html).not.toContain('Mui');
  });
});
