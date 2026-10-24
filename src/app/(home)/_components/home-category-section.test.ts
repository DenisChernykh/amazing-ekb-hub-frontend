import type { CategoryCardModel } from '@/entities/category';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { HomeCategorySection } from './home-category-section';

const CATEGORIES: CategoryCardModel[] = Array.from({ length: 8 }, (_, index) => ({
  id: `category-${index + 1}`,
  slug: `category-${index + 1}`,
  title: `Категория ${index + 1}`,
  image: {
    kind: index < 5 ? 'photo' : 'placeholder',
    src:
      index < 5
        ? `/v1/categories/category-${index + 1}/photo?v=123456789ab${index}`
        : '/images/categories/category-placeholder.svg',
    alt: '',
  },
}));

describe('HomeCategorySection', () => {
  it('renders the city-guide hero with a link to all categories', () => {
    const html = renderToStaticMarkup(
      createElement(HomeCategorySection, { categories: CATEGORIES }),
    );

    expect(html).toContain('Ваш гид по Екатеринбургу');
    expect(html).toContain('Честные обзоры проверенных мест для любого настроения');
    expect(html).toContain('>Все категории<');
    expect(html).toContain('href="/categories"');
    expect(html).toContain('yekaterinburg-panorama.png');
    expect(html.match(/<main\b/g)).toHaveLength(1);
    expect(html.indexOf('<main')).toBeLessThan(html.indexOf('home-hero'));
  });

  it('renders eight category links and the two-layer all-categories action', () => {
    const html = renderToStaticMarkup(
      createElement(HomeCategorySection, { categories: CATEGORIES }),
    );

    expect(html.match(/href="\/categories\/category-\d+"/g)).toHaveLength(8);
    expect(html.match(/href="\/categories"/g)).toHaveLength(1);
    expect(html).toContain('catalog-primary-action');
    expect(html).toContain('Все категории');
    const arrowIconNames = html.match(/lucide-arrow-right/g) ?? [];
    expect(new Set(arrowIconNames)).toHaveLength(1);
    expect(html.match(/object-cover/g)).toHaveLength(5);
    expect(html.match(/object-contain/g)).toHaveLength(3);
  });
});
