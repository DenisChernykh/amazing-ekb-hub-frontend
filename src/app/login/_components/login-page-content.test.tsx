import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';
import { LoginPageContent } from './login-page-content';

vi.mock('@/features/auth-login', async () => {
  const { createElement: createReactElement } = await import('react');

  return {
    LoginForm: ({ redirectTo }: { redirectTo: string }) =>
      createReactElement('form', {
        'data-slot': 'login-form-test-double',
        'data-redirect-to': redirectTo,
      }),
  };
});

describe('LoginPageContent', () => {
  it('server-renders the editorial desktop and form-first mobile contracts', () => {
    const html = renderToStaticMarkup(
      createElement(LoginPageContent, { redirectTo: '/places/example-place' }),
    );

    expect(html.match(/<main\b/g)).toHaveLength(1);
    expect(html).toContain('data-slot="container"');
    expect(html.match(/<h1\b/g)).toHaveLength(1);
    expect(html).toContain('С возвращением');
    expect(html).toContain('Войдите, чтобы продолжить работу с местами.');
    expect(html).toContain('Места и материалы о городе — в одном личном пространстве.');
    expect(html).toContain('Публичный городской каталог');
    expect(html).toContain('lg:grid-cols-');
    expect(html).toContain('hidden');
    expect(html).toContain('lg:flex');
    expect(html).toContain('lg:hidden');
    expect(html).toContain('data-redirect-to="/places/example-place"');
    expect(html).not.toContain('Mui');
  });
});
