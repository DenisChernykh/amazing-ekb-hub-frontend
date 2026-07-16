import type { LoginByCredentialsState } from '@/features/auth-login/model/login-action-state';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { LoginFormFields } from './login-form-fields';

const VALIDATION_STATE: LoginByCredentialsState = {
  status: 'validation_error',
  message: 'Проверьте email и пароль.',
  fieldErrors: {
    email: 'Введите корректный email.',
    password: 'Введите пароль.',
  },
  values: {
    email: 'wrong-email',
  },
};

describe('LoginFormFields', () => {
  it('associates server field errors and restores only the email value', () => {
    const html = renderToStaticMarkup(
      createElement(LoginFormFields, {
        redirectTo: '/auth-lab/protected',
        state: VALIDATION_STATE,
      }),
    );

    expect(html).toContain('name="redirectTo"');
    expect(html).toContain('value="/auth-lab/protected"');
    expect(html).toContain('id="login-email"');
    expect(html).toContain('value="wrong-email"');
    expect(html).toContain('aria-describedby="login-email-error"');
    expect(html).toContain('id="login-email-error"');
    expect(html).toContain('id="login-password"');
    expect(html).toContain('aria-describedby="login-password-error"');
    expect(html).toContain('id="login-password-error"');
    expect(html).not.toMatch(/name="password"[^>]*value=/);
    expect(html).toContain('Не удалось войти');
    expect(html).toContain('Проверьте email и пароль.');
    expect(html).not.toContain('Mui');
  });

  it('does not render alert or invalid attributes for idle state', () => {
    const html = renderToStaticMarkup(
      createElement(LoginFormFields, {
        redirectTo: '/',
        state: {
          status: 'idle',
          message: null,
          fieldErrors: {},
          values: { email: '' },
        },
      }),
    );

    expect(html).not.toContain('role="alert"');
    expect(html).not.toContain('aria-invalid="true"');
    expect(html).not.toContain('aria-describedby');
  });
});
