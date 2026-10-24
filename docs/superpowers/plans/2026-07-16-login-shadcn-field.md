# Login shadcn Field Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Migrate the production login route from MUI to a reusable shadcn Field system and implement the approved editorial desktop/form-first mobile design with expressive accessible errors and a pending spinner.

**Architecture:** Keep `LoginPageContent` as the server-rendered route composition and `LoginForm` as the leaf client boundary backed by the existing server action. Add form-library-agnostic Field primitives through the shadcn CLI, then split the login form into a small hook wrapper plus testable field and submit-button views.

**Tech Stack:** Next.js 16 App Router, React 19 `useActionState`/`useFormStatus`, TypeScript, Tailwind CSS 4, shadcn 4 base-nova, Base UI, Lucide React, Vitest 4 server-rendered component tests.

## Global Constraints

- Do not migrate `src/app/auth-lab` or remove the MUI/Emotion bridge in this plan.
- Do not change `loginByCredentialsAction`, authentication API calls, cookies, permissions, validation, or redirect behavior.
- Do not introduce React Hook Form, TanStack Form, or another form-state library.
- Add shadcn components through `pnpm exec shadcn add`; do not copy registry files manually.
- Do not refactor the catalog `TextField` in this slice.
- Desktop at `lg` and above uses the approved editorial split-screen; below `lg` uses the form-first composition.
- Keep the approved copy exactly as specified in the design document.
- Pending submit keeps the visible label `Войти`, adds a decorative spinner, and never renders `Входим...`.
- Field errors must combine `data-invalid`, `aria-invalid`, stable `aria-describedby`, visible text, and alert semantics.
- Spinner animation must respect reduced-motion preferences.
- Keep handwritten UI files within the project component-size rules; the CLI-generated `field.tsx` is the generated-file exception.
- Preserve cascade layer order `theme, base, mui, components, utilities`.

## File Structure

- Create `src/shared/ui/field.tsx`: CLI-generated, form-library-agnostic Field composition.
- Create `src/shared/ui/separator.tsx`: registry dependency used by `FieldSeparator`.
- Create `src/shared/ui/field.test.tsx`: Field semantics, invalid state, and error normalization.
- Modify `src/shared/ui/label.tsx`: preserve the existing project JSDoc after the CLI refresh.
- Modify `src/shared/ui/index.ts`: export the Field family and Separator through shared UI public API.
- Create `src/features/auth-login/ui/login-form-fields.tsx`: pure login field/error composition driven by `LoginByCredentialsState`.
- Create `src/features/auth-login/ui/login-form-fields.test.tsx`: state-to-markup contract tests.
- Create `src/features/auth-login/ui/login-submit-button.tsx`: `useFormStatus` wrapper and testable pending view.
- Create `src/features/auth-login/ui/login-submit-button.test.tsx`: stable label, disabled state, spinner, reduced-motion class.
- Modify `src/features/auth-login/ui/login-form.tsx`: small `useActionState` form boundary composing the two new units.
- Create `src/app/login/_components/login-page-content.test.tsx`: server composition and responsive visual-contract test.
- Modify `src/app/login/_components/login-page-content.tsx`: approved editorial/form-first layout.
- Modify `docs/architecture/mui-to-shadcn-migration-plan.md`: mark production login and Field contract complete while leaving auth-lab outstanding.

---

### Task 1: Add the shared shadcn Field system

**Files:**

- Create: `src/shared/ui/field.tsx`
- Create: `src/shared/ui/separator.tsx`
- Create: `src/shared/ui/field.test.tsx`
- Modify: `src/shared/ui/label.tsx`
- Modify: `src/shared/ui/index.ts`

**Interfaces:**

- Consumes: existing `cn`, `Label`, Base UI, and project Tailwind tokens.
- Produces: `Field`, `FieldGroup`, `FieldContent`, `FieldLabel`, `FieldDescription`, `FieldError`, `FieldSet`, `FieldLegend`, `FieldSeparator`, `FieldTitle`, and `Separator` from `@/shared/ui`.

- [ ] **Step 1: Write the failing shared Field contract test**

Create `src/shared/ui/field.test.tsx`:

```tsx
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { Input } from './input';
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from './field';

describe('Field', () => {
  it('renders an associated invalid control with description and error semantics', () => {
    const html = renderToStaticMarkup(
      createElement(
        FieldGroup,
        null,
        createElement(
          Field,
          { 'data-invalid': true },
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
```

- [ ] **Step 2: Run the focused test and verify the missing component failure**

Run:

```bash
pnpm exec vitest run src/shared/ui/field.test.tsx
```

Expected: FAIL because `src/shared/ui/field.tsx` does not exist.

- [ ] **Step 3: Preview the registry change before writing files**

Run:

```bash
pnpm exec shadcn add field --dry-run
pnpm exec shadcn add field --dry-run --diff label.tsx
```

Expected:

- create `field.tsx` and `separator.tsx`;
- refresh `label.tsx`;
- no package dependency addition;
- the `label.tsx` diff only removes the project JSDoc from the otherwise matching component.

Stop and inspect if the registry diff changes behavior beyond that known JSDoc difference.

- [ ] **Step 4: Add Field through the CLI**

Run:

```bash
pnpm exec shadcn add field -y
```

Expected: `field.tsx` and `separator.tsx` are created and `label.tsx` is refreshed. Do not pass `--all` or `--overwrite`.

- [ ] **Step 5: Restore project documentation and export the generated primitives**

Restore this block immediately above `function Label` in `src/shared/ui/label.tsx`:

```tsx
/**
 * Рендерит подпись элемента формы.
 */
```

Add concise project JSDoc above the generated `Separator` function:

```tsx
/**
 * Рендерит горизонтальный или вертикальный разделитель.
 */
```

Keep the CLI-generated Field implementation and signatures unchanged. Add concise JSDoc above its generated functions using these exact descriptions:

```tsx
/** Рендерит семантическую группу связанных полей. */
// FieldSet

/** Рендерит заголовок группы полей. */
// FieldLegend

/** Рендерит layout-группу полей формы. */
// FieldGroup

/** Рендерит одно поле формы и его состояние. */
// Field

/** Группирует содержимое поля при сложной ориентации. */
// FieldContent

/** Рендерит связанную подпись поля. */
// FieldLabel

/** Рендерит текстовый заголовок поля без label semantics. */
// FieldTitle

/** Рендерит вспомогательное описание поля. */
// FieldDescription

/** Рендерит разделитель между группами полей. */
// FieldSeparator

/** Рендерит одно или несколько уникальных сообщений об ошибке. */
// FieldError
```

Append these exports to `src/shared/ui/index.ts` in the existing alphabetical grouping:

```ts
export {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSeparator,
  FieldSet,
  FieldTitle,
} from './field';
export { Separator } from './separator';
```

- [ ] **Step 6: Run focused checks and verify the Field contract passes**

Run:

```bash
pnpm exec prettier --check src/shared/ui/field.tsx src/shared/ui/field.test.tsx src/shared/ui/separator.tsx src/shared/ui/label.tsx src/shared/ui/index.ts
pnpm exec vitest run src/shared/ui/field.test.tsx src/shared/ui/text-field.test.ts
pnpm exec tsc --noEmit --pretty false --incremental false
git diff --check
```

Expected: all commands PASS; existing catalog `TextField` test remains green; no MUI file is changed.

- [ ] **Step 7: Commit the shared primitive task**

```bash
git add src/shared/ui/field.tsx src/shared/ui/field.test.tsx src/shared/ui/separator.tsx src/shared/ui/label.tsx src/shared/ui/index.ts
git commit -m "feat(ui): add shared field primitives"
```

### Task 2: Migrate the login form behavior and states

**Files:**

- Create: `src/features/auth-login/ui/login-form-fields.tsx`
- Create: `src/features/auth-login/ui/login-form-fields.test.tsx`
- Create: `src/features/auth-login/ui/login-submit-button.tsx`
- Create: `src/features/auth-login/ui/login-submit-button.test.tsx`
- Modify: `src/features/auth-login/ui/login-form.tsx`

**Interfaces:**

- Consumes: `LoginByCredentialsState`, `loginByCredentialsAction`, and the shared Field/Input/Alert/Button public API from Task 1.
- Produces: the existing public `LoginForm({ redirectTo }: { redirectTo: string })`; route consumers do not change.

- [ ] **Step 1: Write failing tests for state-to-field markup**

Create `src/features/auth-login/ui/login-form-fields.test.tsx`:

```tsx
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
```

Create `src/features/auth-login/ui/login-submit-button.test.tsx`:

```tsx
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { LoginSubmitButtonView } from './login-submit-button';

describe('LoginSubmitButtonView', () => {
  it('keeps a stable label without a spinner while idle', () => {
    const html = renderToStaticMarkup(createElement(LoginSubmitButtonView, { pending: false }));

    expect(html).toContain('>Войти</span>');
    expect(html).not.toContain('disabled');
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
```

- [ ] **Step 2: Run the focused tests and verify missing-module failures**

Run:

```bash
pnpm exec vitest run src/features/auth-login/ui/login-form-fields.test.tsx src/features/auth-login/ui/login-submit-button.test.tsx
```

Expected: FAIL because both new UI modules are missing.

- [ ] **Step 3: Implement the pure field composition**

Create `src/features/auth-login/ui/login-form-fields.tsx`:

```tsx
import type { LoginByCredentialsState } from '@/features/auth-login/model/login-action-state';
import {
  Alert,
  AlertDescription,
  AlertTitle,
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
  Input,
} from '@/shared/ui';
import { CircleAlertIcon } from 'lucide-react';

interface LoginFormFieldsProps {
  redirectTo: string;
  state: LoginByCredentialsState;
}

const EMAIL_ID = 'login-email';
const EMAIL_ERROR_ID = 'login-email-error';
const PASSWORD_ID = 'login-password';
const PASSWORD_ERROR_ID = 'login-password-error';

/**
 * Рендерит поля и server feedback формы входа.
 */
export function LoginFormFields({ redirectTo, state }: Readonly<LoginFormFieldsProps>) {
  const emailError = state.fieldErrors.email;
  const passwordError = state.fieldErrors.password;

  return (
    <>
      <input name="redirectTo" type="hidden" value={redirectTo} />

      {state.message && (
        <Alert variant="destructive" className="px-3 py-3">
          <CircleAlertIcon aria-hidden="true" />
          <AlertTitle>Не удалось войти</AlertTitle>
          <AlertDescription>{state.message}</AlertDescription>
        </Alert>
      )}

      <FieldGroup>
        <Field data-invalid={Boolean(emailError)}>
          <FieldLabel htmlFor={EMAIL_ID}>Email</FieldLabel>
          <Input
            id={EMAIL_ID}
            aria-describedby={emailError ? EMAIL_ERROR_ID : undefined}
            aria-invalid={emailError ? true : undefined}
            autoComplete="username"
            className="h-11 rounded-sm px-3"
            defaultValue={state.values.email}
            name="email"
            required
            type="email"
          />
          {emailError && <FieldError id={EMAIL_ERROR_ID}>{emailError}</FieldError>}
        </Field>

        <Field data-invalid={Boolean(passwordError)}>
          <FieldLabel htmlFor={PASSWORD_ID}>Пароль</FieldLabel>
          <Input
            id={PASSWORD_ID}
            aria-describedby={passwordError ? PASSWORD_ERROR_ID : undefined}
            aria-invalid={passwordError ? true : undefined}
            autoComplete="current-password"
            className="h-11 rounded-sm px-3"
            name="password"
            required
            type="password"
          />
          {passwordError && <FieldError id={PASSWORD_ERROR_ID}>{passwordError}</FieldError>}
        </Field>
      </FieldGroup>
    </>
  );
}
```

- [ ] **Step 4: Implement the pending submit composition**

Create `src/features/auth-login/ui/login-submit-button.tsx`:

```tsx
'use client';

import { Button } from '@/shared/ui';
import { LoaderCircleIcon } from 'lucide-react';
import { useFormStatus } from 'react-dom';

interface LoginSubmitButtonViewProps {
  pending: boolean;
}

/**
 * Рендерит тестируемое визуальное состояние login submit.
 */
export function LoginSubmitButtonView({ pending }: Readonly<LoginSubmitButtonViewProps>) {
  return (
    <Button className="h-12 w-full" disabled={pending} size="lg" type="submit">
      {pending && (
        <LoaderCircleIcon
          aria-hidden="true"
          className="motion-safe:animate-spin"
          data-slot="login-submit-spinner"
        />
      )}
      <span>Войти</span>
    </Button>
  );
}

/**
 * Связывает login submit с pending-состоянием родительской формы.
 */
export function LoginSubmitButton() {
  const { pending } = useFormStatus();

  return <LoginSubmitButtonView pending={pending} />;
}
```

- [ ] **Step 5: Reduce `LoginForm` to the client action boundary**

Replace `src/features/auth-login/ui/login-form.tsx` with:

```tsx
'use client';

import { LOGIN_INITIAL_STATE } from '@/features/auth-login/model/login-action-state';
import { useActionState } from 'react';
import { loginByCredentialsAction } from '../server/login-by-credentials-action';
import { LoginFormFields } from './login-form-fields';
import { LoginSubmitButton } from './login-submit-button';

interface LoginFormProps {
  redirectTo: string;
}

/**
 * Рендерит форму входа по email и паролю через server action.
 */
export function LoginForm({ redirectTo }: Readonly<LoginFormProps>) {
  const [state, formAction] = useActionState(loginByCredentialsAction, LOGIN_INITIAL_STATE);

  return (
    <form action={formAction} className="space-y-5" noValidate>
      <LoginFormFields redirectTo={redirectTo} state={state} />
      <LoginSubmitButton />
    </form>
  );
}
```

- [ ] **Step 6: Run focused form checks**

Run:

```bash
pnpm exec prettier --check src/features/auth-login/ui/login-form.tsx src/features/auth-login/ui/login-form-fields.tsx src/features/auth-login/ui/login-form-fields.test.tsx src/features/auth-login/ui/login-submit-button.tsx src/features/auth-login/ui/login-submit-button.test.tsx
pnpm exec vitest run src/shared/ui/field.test.tsx src/features/auth-login/ui/login-form-fields.test.tsx src/features/auth-login/ui/login-submit-button.test.tsx
pnpm exec tsc --noEmit --pretty false --incremental false
rg -n "@mui|Входим\.\.\." src/features/auth-login/ui
git diff --check
```

Expected:

- formatting, tests, and TypeScript PASS;
- `rg` returns no matches and exits with status 1;
- no password `value` attribute appears in rendered tests.

- [ ] **Step 7: Commit the login form migration**

```bash
git add src/features/auth-login/ui/login-form.tsx src/features/auth-login/ui/login-form-fields.tsx src/features/auth-login/ui/login-form-fields.test.tsx src/features/auth-login/ui/login-submit-button.tsx src/features/auth-login/ui/login-submit-button.test.tsx
git commit -m "refactor(auth): migrate login form to shadcn"
```

### Task 3: Implement the approved editorial login page

**Files:**

- Create: `src/app/login/_components/login-page-content.test.tsx`
- Modify: `src/app/login/_components/login-page-content.tsx`

**Interfaces:**

- Consumes: existing `LoginForm({ redirectTo })` and shared `Container`.
- Produces: a server-rendered `<main>` with one `<h1>`, `lg` editorial split-screen, and sub-`lg` form-first presentation.

- [ ] **Step 1: Write the failing page composition test**

Create `src/app/login/_components/login-page-content.test.tsx`:

```tsx
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
      createElement(LoginPageContent, { redirectTo: '/auth-lab/protected' }),
    );

    expect(html).toContain('<main');
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
    expect(html).toContain('data-redirect-to="/auth-lab/protected"');
    expect(html).not.toContain('Mui');
  });
});
```

- [ ] **Step 2: Run the page test and verify it fails against the MUI layout**

Run:

```bash
pnpm exec vitest run src/app/login/_components/login-page-content.test.tsx
```

Expected: FAIL because the current page has the old copy, MUI markup, and no editorial responsive classes.

- [ ] **Step 3: Implement the server-rendered page composition**

Replace `src/app/login/_components/login-page-content.tsx` with:

```tsx
import { LoginForm } from '@/features/auth-login';
import { Container } from '@/shared/ui';

interface LoginPageContentProps {
  redirectTo: string;
}

/**
 * Рендерит route-private editorial экран логина.
 */
export function LoginPageContent({ redirectTo }: Readonly<LoginPageContentProps>) {
  return (
    <Container as="main" className="flex min-h-dvh items-center py-6 sm:py-10 lg:py-14">
      <section className="mx-auto grid w-full max-w-5xl overflow-hidden rounded-2xl bg-card shadow-[0_20px_55px_rgb(20_29_45_/_12%)] ring-1 ring-border lg:min-h-[620px] lg:grid-cols-[minmax(0,0.82fr)_minmax(0,1.18fr)]">
        <aside className="relative hidden overflow-hidden bg-primary p-10 text-primary-foreground lg:flex lg:flex-col lg:justify-between">
          <div
            aria-hidden="true"
            className="absolute top-20 -left-48 size-96 rounded-full border border-primary-foreground/15"
          />
          <div
            aria-hidden="true"
            className="absolute -right-32 -bottom-28 size-72 rounded-full border border-primary-foreground/10"
          />

          <div className="relative z-10 flex items-center gap-3 text-xs font-bold tracking-[0.08em] uppercase">
            <span className="relative size-7 rounded-[0.55rem_0.55rem_0.55rem_0.2rem] bg-primary-foreground">
              <span className="absolute top-1.5 left-2.5 size-1.5 rounded-full bg-primary" />
            </span>
            Стрельчук
          </div>

          <p className="relative z-10 max-w-sm font-heading text-4xl leading-[1.12] font-bold tracking-[-0.035em]">
            Места и материалы о городе — в одном личном пространстве.
          </p>

          <p className="relative z-10 text-xs leading-relaxed text-primary-foreground/65">
            Екатеринбург
            <br />
            Публичный городской каталог
          </p>
        </aside>

        <div className="flex items-center bg-card px-5 py-10 sm:px-10 lg:px-14">
          <div className="mx-auto w-full max-w-sm">
            <div className="mb-8 flex items-center gap-2 text-xs font-bold tracking-[0.07em] text-primary uppercase lg:hidden">
              <span className="relative size-6 rounded-[0.5rem_0.5rem_0.5rem_0.2rem] bg-primary">
                <span className="absolute top-1.5 left-2 size-1.5 rounded-full bg-primary-foreground" />
              </span>
              Стрельчук · Екатеринбург
            </div>

            <header className="mb-6">
              <h1 className="font-heading text-4xl leading-none font-bold tracking-[-0.045em]">
                С возвращением
              </h1>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                Войдите, чтобы продолжить работу с местами.
              </p>
            </header>

            <LoginForm redirectTo={redirectTo} />
          </div>
        </div>
      </section>
    </Container>
  );
}
```

- [ ] **Step 4: Run focused page and form checks**

Run:

```bash
pnpm exec prettier --check src/app/login/_components/login-page-content.tsx src/app/login/_components/login-page-content.test.tsx
pnpm exec vitest run src/app/login/_components/login-page-content.test.tsx src/features/auth-login/ui/login-form-fields.test.tsx src/features/auth-login/ui/login-submit-button.test.tsx
pnpm exec tsc --noEmit --pretty false --incremental false
rg -n "@mui|appStyleTokens|Mui" src/app/login src/features/auth-login/ui
git diff --check
```

Expected: formatting, tests, and TypeScript PASS; `rg` returns no matches and exits with status 1.

- [ ] **Step 5: Commit the login page redesign**

```bash
git add src/app/login/_components/login-page-content.tsx src/app/login/_components/login-page-content.test.tsx
git commit -m "refactor(auth): redesign login page"
```

### Task 4: Verify the visual contract and close the migration slice

**Files:**

- Modify: `docs/architecture/mui-to-shadcn-migration-plan.md`

**Interfaces:**

- Consumes: completed shared Field, login form, and page tasks.
- Produces: verified desktop/mobile login behavior and an updated source-of-truth migration plan.

- [ ] **Step 1: Update the migration plan with the completed contract**

Under Phase 3 `Completed slice`, add:

```markdown
- Production login now uses the shared shadcn `Field`, `Input`, `Alert`, and `Button` contracts while preserving the existing server action, credential safety, validation, and redirect flow.
- Login uses the explicitly approved editorial desktop/form-first mobile redesign. Field errors combine visible text, invalid styling, and explicit accessible associations; pending submit keeps the stable `Войти` label and adds a reduced-motion-safe spinner.
```

Replace the Phase 3 remaining-work list with:

```markdown
Remaining work:

1. Auth lab/debug surfaces if they are still useful.
```

Do not mark Phase 5 ready: auth-lab and the root MUI providers remain.

- [ ] **Step 2: Run the complete static quality gate**

Run:

```bash
pnpm run format:check
pnpm run lint:strict
pnpm run test:unit
pnpm run typecheck
pnpm run build
rg -n "@mui|@emotion|AppRouterCacheProvider|ThemeProvider|CssBaseline" src package.json
git diff --check
```

Expected:

- formatting, lint, unit tests, typecheck, and build PASS;
- MUI search still reports only the intentional auth-lab, provider/layout, theme, and package bridge files;
- no MUI match appears in `src/app/login` or `src/features/auth-login/ui`.

- [ ] **Step 3: Run the login route and capture the approved states**

Start the frontend without running `pnpm run typecheck` concurrently with the live dev process:

```bash
pnpm dev
```

Use the existing local backend/runtime contract, then verify `/login` at:

- desktop 1440 × 1000: idle, field errors, form error, pending;
- mobile 390 × 844: idle and field errors;
- keyboard-only focus order: email → password → submit;
- reduced-motion emulation: spinner does not rotate;
- legacy MUI smoke: `/auth-lab` still renders in local development.

Expected visual evidence:

- the editorial panel appears only at `lg` and above;
- mobile shows the compact brand label but not the story panel;
- long errors wrap vertically without overlap;
- focus rings remain visible over normal and destructive borders;
- pending keeps `Войти`, adds the spinner, and prevents double submit;
- no hydration error or client console error appears.

- [ ] **Step 4: Commit migration documentation**

```bash
git add docs/architecture/mui-to-shadcn-migration-plan.md
git commit -m "docs(ui): complete login migration slice"
```

- [ ] **Step 5: Perform final branch verification**

Run:

```bash
git status --short --branch
git log --oneline origin/stage..HEAD
git diff --stat origin/stage...HEAD
git diff --check origin/stage...HEAD
```

Expected:

- branch contains the approved design/plan docs plus four logical implementation commits;
- only `.superpowers/` may remain untracked from visual brainstorming and must not be staged;
- no unexpected source, generated API, or package-lock changes appear.

## Completion Definition

The slice is complete only when the shared Field system, login form, editorial page, tests, migration plan, desktop/mobile visual evidence, legacy auth-lab smoke check, and full quality gate all pass. Do not remove MUI providers or packages in this branch.
