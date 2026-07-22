import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { PlaceCategoryBadge } from './place-category-badge';

describe('PlaceCategoryBadge', () => {
  it('renders backend category title with project-owned secondary styling', () => {
    const html = renderToStaticMarkup(
      createElement(PlaceCategoryBadge, {
        className: 'absolute left-3 top-3',
        category: {
          id: 'category_family_spa',
          slug: 'family-spa',
          title: 'Family SPA',
          coverImageUrl: null,
        },
      }),
    );

    expect(html).toContain('Family SPA');
    expect(html).toContain('bg-secondary');
    expect(html).toContain('text-secondary-foreground');
    expect(html).not.toContain('background-color:');
    expect(html).toContain('data-slot="badge"');
    expect(html).toContain('absolute left-3 top-3');
    expect(html).not.toContain('MuiChip');
  });
});
