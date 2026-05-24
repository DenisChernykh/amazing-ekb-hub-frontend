import type { PlaceDetailModel } from '@/entities/place';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { PlaceDetail } from './place-detail';

const LINKED_MATERIAL_URL = 'https://dzen.ru/shorts/place-guide?utm=card';

const PLACE_DETAIL_WITH_LINKED_MATERIAL: PlaceDetailModel = {
  id: 'place_ekb_001',
  title: 'Baden-Baden Uktus',
  summary: 'Thermal complex with spa zone.',
  tags: ['spa'],
  category: 'spa',
  coverImageUrl: null,
  platformCounters: {
    dzen: 1,
    telegram: 0,
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
    telegram: [],
    instagram: [],
  },
};

describe('PlaceDetail', () => {
  it('renders linked material rows as external links around the row content', () => {
    const html = renderToStaticMarkup(
      createElement(PlaceDetail, {
        place: PLACE_DETAIL_WITH_LINKED_MATERIAL,
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
});
