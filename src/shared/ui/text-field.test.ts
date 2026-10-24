import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { TextField } from './text-field';

describe('TextField', () => {
  it('renders an associated floating label and forwards native input props', () => {
    const html = renderToStaticMarkup(
      createElement(TextField, {
        id: 'catalog-search',
        label: 'Поиск',
        name: 'search',
        defaultValue: 'spa',
        placeholder: 'Название или описание места',
        maxLength: 100,
      }),
    );

    expect(html).toContain('data-slot="text-field"');
    expect(html).toContain('data-slot="input"');
    expect(html).toContain('data-slot="label"');
    expect(html).toContain('id="catalog-search"');
    expect(html).toContain('for="catalog-search"');
    expect(html).toContain('name="search"');
    expect(html).toContain('value="spa"');
    expect(html).toContain('placeholder="Название или описание места"');
    expect(html).toMatch(/maxlength="100"/i);
    expect(html).toContain('>Поиск</label>');
    expect(html).not.toContain('Mui');
  });
});
