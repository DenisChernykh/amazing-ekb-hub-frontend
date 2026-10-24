import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { PaginationLink } from './pagination';

describe('PaginationLink', () => {
  it('preserves native anchor semantics for pagination destinations', () => {
    const html = renderToStaticMarkup(createElement(PaginationLink, { href: '/?page=2' }, '2'));

    expect(html).toMatch(/^<a\b/);
    expect(html).toContain('href="/?page=2"');
    expect(html).not.toContain('role="button"');
    expect(html).not.toMatch(/\btabindex=/i);
  });
});
