import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import type { PlaceCardModel } from '../model/types';
import { PlaceCardBadges } from './place-card-badges';

const PLACE: PlaceCardModel = {
  id: 'place ekb/001',
  title: 'Баден-Баден Уктус',
  category: {
    id: 'category_spa',
    slug: 'spa',
    title: 'SPA',
    badgeBackgroundColor: '#faf0ed',
  },
  coverImageUrl: null,
  platformCounters: {
    dzen: 12,
    telegram: 7,
    instagram: 0,
  },
};

describe('PlaceCardBadges', () => {
  it('renders positive platform counters as semantic shadcn link badges', () => {
    const html = renderToStaticMarkup(createElement(PlaceCardBadges, { place: PLACE }));

    expect(html).toContain('role="group"');
    expect(html).toContain('aria-label="Категория и материалы"');
    expect(html).toContain('class="flex min-h-7 flex-wrap gap-1.5"');
    expect(html.match(/data-slot="badge"/g)).toHaveLength(2);
    expect(html).toContain('href="/places/place%20ekb%2F001#materials-dzen"');
    expect(html).toContain('href="/places/place%20ekb%2F001#materials-telegram"');
    expect(html.indexOf('materials-dzen')).toBeLessThan(html.indexOf('materials-telegram'));
    expect(html).not.toContain('materials-instagram');
    expect(html).toContain('>12<');
    expect(html).toContain('>Дзен<');
    expect(html).toContain('>7<');
    expect(html).toContain('>Telegram<');
    expect(html).toContain('h-6');
    expect(html).toContain('size-[18px]');
    expect(html).toContain('bg-white/72');
    expect(html).toContain('background-color:#e5e7eb');
    expect(html).toContain('background-color:#dff3ff');
    expect(html).toContain('hover:brightness-95');
    expect(html).toContain('focus-visible:ring-[3px]');
    expect(html).not.toContain('MuiChip');
    expect(html).not.toContain('MuiAvatar');
  });

  it('keeps an empty fixed-height group when every counter is zero', () => {
    const html = renderToStaticMarkup(
      createElement(PlaceCardBadges, {
        place: {
          ...PLACE,
          platformCounters: {
            dzen: 0,
            telegram: 0,
            instagram: 0,
          },
        },
      }),
    );

    expect(html).toContain('role="group"');
    expect(html).toContain('aria-label="Категория и материалы"');
    expect(html).toContain('min-h-7');
    expect(html).not.toContain('<a ');
    expect(html).not.toContain('data-slot="badge"');
  });
});
