import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { SiteHeader } from './site-header';

describe('SiteHeader', () => {
  it('server-renders expanded semantic navigation', () => {
    const html = renderToStaticMarkup(createElement(SiteHeader));

    expect(html).toContain('aria-label="Основная навигация"');
    expect(html).toContain('href="/"');
    expect(html).toContain('Стрельчук в Екатеринбурге');
    expect(html).toContain('href="/categories"');
    expect(html).toContain('>Категории<');
    expect(html).toContain('site-header-expanded');
    expect(html).not.toMatch(/hamburger|backdrop-blur|shadow/);
  });
});
