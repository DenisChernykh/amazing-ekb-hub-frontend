import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';
import { PlacesAppendControl } from './places-append-control';

describe('PlacesAppendControl', () => {
  it('renders an idle sentinel and omits the control at the end', () => {
    const idleHtml = renderToStaticMarkup(
      createElement(PlacesAppendControl, {
        status: 'idle',
        sentinelRef: { current: null },
        onRetry: vi.fn(),
      }),
    );
    const endHtml = renderToStaticMarkup(
      createElement(PlacesAppendControl, {
        status: 'end',
        sentinelRef: { current: null },
        onRetry: vi.fn(),
      }),
    );

    expect(idleHtml).toContain('data-category-places-sentinel="true"');
    expect(endHtml).toBe('');
  });

  it('renders a textless visual loader with an accessible live status', () => {
    const html = renderToStaticMarkup(
      createElement(PlacesAppendControl, {
        status: 'loading',
        sentinelRef: { current: null },
        onRetry: vi.fn(),
      }),
    );

    expect(html).toContain('role="status"');
    expect(html).toContain('aria-live="polite"');
    expect(html).toContain('class="sr-only">Загружаем следующие места</span>');
    expect(html).toContain('aria-hidden="true"');
    expect(html).toContain('places-append-loader-track');
    expect(html).toContain('places-append-loader-segment');
  });

  it('renders an explicit retry button while preserving the append control height', () => {
    const html = renderToStaticMarkup(
      createElement(PlacesAppendControl, {
        status: 'error',
        sentinelRef: { current: null },
        onRetry: vi.fn(),
      }),
    );

    expect(html).toContain('places-append-control');
    expect(html).toContain('<button');
    expect(html).toContain('>Повторить</button>');
  });
});
