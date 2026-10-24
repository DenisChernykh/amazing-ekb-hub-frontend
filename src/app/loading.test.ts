import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import Loading from './loading';

describe('Loading', () => {
  it('renders app loading status through the shared skeleton contract', () => {
    const html = renderToStaticMarkup(createElement(Loading));

    expect(html).toContain('aria-busy="true"');
    expect(html).toContain('role="status"');
    expect(html).toContain('aria-label="Загрузка"');
    expect(html).toContain('data-slot="container"');
    expect(html).toContain('Загрузка...');
    expect(html).toContain('data-slot="skeleton"');
    expect(html).not.toContain('CircularProgress');
    expect(html).not.toContain('Mui');
  });
});
