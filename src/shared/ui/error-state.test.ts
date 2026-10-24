import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import { ErrorState } from './error-state';

describe('ErrorState', () => {
  it('renders route error details through the shared alert contract', () => {
    const html = renderToStaticMarkup(
      createElement(ErrorState, {
        title: 'Не удалось загрузить данные',
        description: 'Попробуйте обновить страницу.',
        issues: [
          { path: 'search', message: 'Минимум 2 символа' },
          { message: 'Сервис временно недоступен' },
        ],
        requestId: 'req_123',
      }),
    );

    expect(html).toContain('data-slot="alert"');
    expect(html).toContain('role="alert"');
    expect(html).toContain('data-slot="alert-title"');
    expect(html).toContain('Не удалось загрузить данные');
    expect(html).toContain('Попробуйте обновить страницу.');
    expect(html).toContain('search: Минимум 2 символа');
    expect(html).toContain('Сервис временно недоступен');
    expect(html).toContain('Request ID: req_123');
    expect(html).not.toContain('Mui');
  });
});
