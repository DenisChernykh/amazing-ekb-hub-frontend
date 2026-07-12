import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { PlaceCategoryBadge } from './place-category-badge';

describe('PlaceCategoryBadge', () => {
  it('renders backend category title and badge background color', () => {
    const html = renderToStaticMarkup(
      createElement(PlaceCategoryBadge, {
        className: 'absolute left-3 top-3',
        category: {
          id: 'category_family_spa',
          slug: 'family-spa',
          title: 'Family SPA',
          badgeBackgroundColor: '#faf0ed',
        },
      }),
    );

    expect(html).toContain('Family SPA');
    expect(html).toContain('background-color:#faf0ed');
    expect(html).toContain('data-slot="badge"');
    expect(html).toContain('absolute left-3 top-3');
    expect(html).not.toContain('MuiChip');
  });
});
