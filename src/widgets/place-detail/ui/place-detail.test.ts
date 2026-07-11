import type { PlaceDetailModel } from '@/entities/place';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { PlaceDetail } from './place-detail';

const DIRECT_DZEN_MATERIAL_URL = 'https://video.example.test/shorts/place-guide?utm=card';
const DZEN_REDIRECT_URL = '/v1/materials/material_dzen_001/go';
const PINNED_DZEN_REDIRECT_URL = '/v1/materials/material_pinned_001/go';

const PLACE_DETAIL_WITHOUT_PINNED_MATERIAL: PlaceDetailModel = {
  id: 'place_ekb_001',
  title: 'Baden-Baden Uktus',
  summary: 'Thermal complex with spa zone.',
  tags: ['spa'],
  category: {
    id: 'category_spa',
    slug: 'spa',
    title: 'SPA',
    badgeBackgroundColor: '#faf0ed',
  },
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
        redirectUrl: DZEN_REDIRECT_URL,
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
        redirectUrl: '/v1/materials/material_telegram_001/go',
      },
    ],
    instagram: [],
  },
};

describe('PlaceDetail', () => {
  it('renders linked material rows through backend redirect links around the row content', () => {
    const html = renderToStaticMarkup(
      createElement(PlaceDetail, {
        place: PLACE_DETAIL_WITHOUT_PINNED_MATERIAL,
      }),
    );

    const hrefIndex = html.indexOf(`href="${DZEN_REDIRECT_URL}"`);
    const titleIndex = html.indexOf('Dzen shorts walkthrough');

    expect(hrefIndex).toBeGreaterThanOrEqual(0);
    expect(titleIndex).toBeGreaterThanOrEqual(0);
    expect(hrefIndex).toBeLessThan(titleIndex);
    expect(html).toContain('target="_blank"');
    expect(html).toContain('rel="noopener noreferrer"');
    expect(html).not.toContain(`href="${DIRECT_DZEN_MATERIAL_URL}"`);
    expect(html).toContain('Dzen shorts walkthrough');
    expect(html).toContain('Видео');
    expect(html).toContain('<main');
    expect(html).toContain('<h1');
    expect(html).toContain('href="#materials-telegram"');
    expect(html).toContain('data-material-id="material_dzen_001"');
    expect(html).toContain('data-focus-stage="true"');
    expect(html).toContain('aria-hidden="true"');
    expect(html).not.toContain('Mui');
    expect(html).not.toContain('Thermal complex with spa zone.');
    expect(html).not.toContain('aria-label="Теги места"');
  });

  it('does not render an empty pinned material block when pinned material is missing', () => {
    const html = renderToStaticMarkup(
      createElement(PlaceDetail, {
        place: PLACE_DETAIL_WITHOUT_PINNED_MATERIAL,
      }),
    );

    expect(html).not.toContain('Закрепленный материал пока не назначен.');
    expect(html).toContain('Публикации о месте');
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
            redirectUrl: null,
          },
        },
      }),
    );

    expect(html).toContain('Закрепленный материал');
    expect(html).toContain('Assigned pinned material without URL');
    expect(html).not.toContain('Открыть материал');
  });

  it('renders pinned material CTA through backend redirect link', () => {
    const html = renderToStaticMarkup(
      createElement(PlaceDetail, {
        place: {
          ...PLACE_DETAIL_WITHOUT_PINNED_MATERIAL,
          pinnedMaterial: {
            id: 'material_pinned_001',
            platform: 'dzen',
            type: 'video',
            title: 'Pinned Dzen material',
            publishedAt: '2026-03-20T10:30:00.000Z',
            durationSec: 60,
            redirectUrl: PINNED_DZEN_REDIRECT_URL,
          },
        },
      }),
    );

    expect(html).toContain(`href="${PINNED_DZEN_REDIRECT_URL}"`);
    expect(html).toContain('target="_blank"');
    expect(html).toContain('rel="noopener noreferrer"');
    expect(html).not.toContain(`href="${DIRECT_DZEN_MATERIAL_URL}"`);
  });
});
