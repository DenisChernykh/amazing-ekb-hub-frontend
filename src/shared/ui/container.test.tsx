import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import { Container } from './index';

describe('Container', () => {
  it('renders a centered responsive div and forwards native props', () => {
    const html = renderToStaticMarkup(
      createElement(
        Container,
        {
          'aria-label': 'Основное содержимое',
          className: 'py-8',
          id: 'page-shell',
        },
        'Содержимое',
      ),
    );

    expect(html).toContain('<div');
    expect(html).toContain('data-slot="container"');
    expect(html).toContain('class="container mx-auto px-4 sm:px-6 lg:px-8 py-8"');
    expect(html).toContain('id="page-shell"');
    expect(html).toContain('aria-label="Основное содержимое"');
    expect(html).toContain('>Содержимое</div>');
  });

  it('supports the approved main and section semantics', () => {
    const mainHtml = renderToStaticMarkup(
      createElement(Container, { as: 'main', 'aria-busy': true }, 'Main'),
    );
    const sectionHtml = renderToStaticMarkup(
      createElement(Container, { as: 'section', 'aria-label': 'Каталог' }, 'Section'),
    );

    expect(mainHtml).toContain('<main');
    expect(mainHtml).toContain('aria-busy="true"');
    expect(mainHtml).toContain('>Main</main>');
    expect(sectionHtml).toContain('<section');
    expect(sectionHtml).toContain('aria-label="Каталог"');
    expect(sectionHtml).toContain('>Section</section>');
  });
});
