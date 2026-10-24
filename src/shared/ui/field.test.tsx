import { createElement, type ComponentProps } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from './field';
import { Input } from './input';

describe('Field', () => {
  it('renders an associated invalid control with description and error semantics', () => {
    const html = renderToStaticMarkup(
      createElement(
        FieldGroup,
        null,
        createElement(
          Field,
          { 'data-invalid': true } as ComponentProps<typeof Field>,
          createElement(FieldLabel, { htmlFor: 'email' }, 'Email'),
          createElement(Input, {
            id: 'email',
            'aria-invalid': true,
            'aria-describedby': 'email-description email-error',
          }),
          createElement(FieldDescription, { id: 'email-description' }, 'Рабочая почта'),
          createElement(FieldError, { id: 'email-error' }, 'Введите корректный email.'),
        ),
      ),
    );

    expect(html).toContain('data-slot="field-group"');
    expect(html).toContain('data-slot="field"');
    expect(html).toContain('data-invalid="true"');
    expect(html).toContain('for="email"');
    expect(html).toContain('aria-invalid="true"');
    expect(html).toContain('aria-describedby="email-description email-error"');
    expect(html).toContain('role="alert"');
    expect(html).toContain('Введите корректный email.');
  });

  it('deduplicates multiple errors and keeps distinct messages', () => {
    const html = renderToStaticMarkup(
      createElement(FieldError, {
        errors: [
          { message: 'Введите email.' },
          { message: 'Введите email.' },
          { message: 'Используйте рабочий адрес.' },
        ],
      }),
    );

    expect(html.match(/Введите email\./g)).toHaveLength(1);
    expect(html).toContain('Используйте рабочий адрес.');
    expect(html).toContain('<ul');
  });
});
