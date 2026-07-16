import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { LoginSubmitButtonView } from './login-submit-button';

describe('LoginSubmitButtonView', () => {
  it('keeps a stable label without a spinner while idle', () => {
    const html = renderToStaticMarkup(createElement(LoginSubmitButtonView, { pending: false }));

    expect(html).toContain('>Войти</span>');
    expect(html).not.toMatch(/<button[^>]*\sdisabled(?:=|>|\s)/);
    expect(html).not.toContain('data-slot="login-submit-spinner"');
    expect(html).not.toContain('Входим...');
  });

  it('disables submit and renders a reduced-motion-safe spinner while pending', () => {
    const html = renderToStaticMarkup(createElement(LoginSubmitButtonView, { pending: true }));

    expect(html).toContain('disabled');
    expect(html).toContain('data-slot="login-submit-spinner"');
    expect(html).toContain('motion-safe:animate-spin');
    expect(html).toContain('aria-hidden="true"');
    expect(html).toContain('>Войти</span>');
    expect(html).not.toContain('Входим...');
  });
});
