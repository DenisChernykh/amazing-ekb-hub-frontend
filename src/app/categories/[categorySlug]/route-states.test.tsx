import type { ReactElement } from 'react';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';
import CategoryError from './error';
import CategoryLoading from './loading';

describe('category route states', () => {
  it('renders a stable visible loading status without card skeletons', () => {
    const html = renderToStaticMarkup(createElement(CategoryLoading));

    expect(html).toContain('<main');
    expect(html).toContain('role="status"');
    expect(html).toContain('aria-live="polite"');
    expect(html).toContain('Открываем категорию…');
    expect(html).not.toContain('skeleton');
    expect(html).not.toContain('place-card');
  });

  it('renders the route error copy and wires reset to a rectangular button', () => {
    const reset = vi.fn();
    const tree = CategoryError({
      error: new Error('backend offline'),
      reset,
    }) as ReactElement<{ children: ReactElement<{ children: ReactElement[] }> }>;
    const section = tree.props.children;
    const button = section.props.children[2] as ReactElement<{
      className: string;
      onClick: () => void;
      type: string;
    }>;
    const html = renderToStaticMarkup(tree);

    expect(html).toContain('Не удалось загрузить категорию');
    expect(html).toContain('Попробуйте запросить данные ещё раз.');
    expect(html).toContain('>Повторить</button>');
    expect(button.props.type).toBe('button');
    expect(button.props.className).not.toContain('rounded');

    button.props.onClick();
    expect(reset).toHaveBeenCalledOnce();
  });
});
