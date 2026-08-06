import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';
import { RetryableRouteError } from './retryable-route-error';

describe('RetryableRouteError', () => {
  it('renders one shared alert and retry button contract', () => {
    const html = renderToStaticMarkup(
      createElement(RetryableRouteError, {
        title: 'Не удалось загрузить подборку',
        description: 'Попробуйте запросить данные ещё раз.',
        retry: vi.fn(),
      }),
    );

    expect(html).toContain('role="alert"');
    expect(html).toContain('Не удалось загрузить подборку');
    expect(html).toContain('Попробуйте запросить данные ещё раз.');
    expect(html).toContain('data-slot="button"');
    expect(html).toContain('>Повторить</button>');
  });
});
