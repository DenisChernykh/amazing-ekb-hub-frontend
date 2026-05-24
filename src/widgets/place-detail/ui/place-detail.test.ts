import type { PlaceDetailModel } from '@/entities/place';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { PlaceDetail } from './place-detail';

const LINKED_MATERIAL_URL = 'https://dzen.ru/shorts/place-guide?utm=card';

const PLACE_DETAIL_WITHOUT_PINNED_MATERIAL: PlaceDetailModel = {
  id: 'place_ekb_001',
  title: 'Baden-Baden Uktus',
  summary: 'Thermal complex with spa zone.',
  tags: ['spa'],
  category: 'spa',
  coverImageUrl: null,
  platformCounters: {
    dzen: 1,
    telegram: 1,
    instagram: 0,
  },
  pinnedMaterial: null,
  materialsByPlatform: {
    dzen: [
      {
        id: 'material_dzen_001',
        platform: 'dzen',
        type: 'video',
        title: 'Dzen shorts walkthrough',
        publishedAt: '2026-03-20T10:30:00.000Z',
        durationSec: 45,
        url: LINKED_MATERIAL_URL,
      },
    ],
    telegram: [
      {
        id: 'material_telegram_001',
        platform: 'telegram',
        type: 'post',
        title: 'Telegram guide',
        publishedAt: '2026-03-20T10:30:00.000Z',
        durationSec: null,
        url: 'https://t.me/amazing_ekb/321',
      },
    ],
    instagram: [],
  },
};

describe('PlaceDetail', () => {
  it('renders linked material rows as external links around the row content', () => {
    const html = renderToStaticMarkup(
      createElement(PlaceDetail, {
        place: PLACE_DETAIL_WITHOUT_PINNED_MATERIAL,
      }),
    );

    const hrefIndex = html.indexOf(`href="${LINKED_MATERIAL_URL}"`);
    const titleIndex = html.indexOf('Dzen shorts walkthrough');

    expect(hrefIndex).toBeGreaterThanOrEqual(0);
    expect(titleIndex).toBeGreaterThanOrEqual(0);
    expect(hrefIndex).toBeLessThan(titleIndex);
    expect(html).toContain('target="_blank"');
    expect(html).toContain('rel="noreferrer"');
  });

  it('does not render an empty pinned material block when pinned material is missing', () => {
    const html = renderToStaticMarkup(
      createElement(PlaceDetail, {
        place: PLACE_DETAIL_WITHOUT_PINNED_MATERIAL,
      }),
    );

    expect(html).not.toContain('Закрепленный материал пока не назначен.');
    expect(html).toContain('Материалы по платформам');
    expect(html).toContain('Telegram guide');
  });

  it('keeps an assigned pinned material visible even when its URL is unavailable', () => {
    const html = renderToStaticMarkup(
      createElement(PlaceDetail, {
        place: {
          ...PLACE_DETAIL_WITHOUT_PINNED_MATERIAL,
          pinnedMaterial: {
            id: 'material_pinned_001',
            platform: 'telegram',
            type: 'post',
            title: 'Assigned pinned material without URL',
            publishedAt: '2026-03-20T10:30:00.000Z',
            durationSec: null,
            url: null,
          },
        },
      }),
    );

    expect(html).toContain('Закрепленный материал');
    expect(html).toContain('Assigned pinned material without URL');
    expect(html).not.toContain('Открыть материал');
  });
});
