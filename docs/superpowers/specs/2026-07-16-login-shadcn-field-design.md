# Login shadcn Field Migration Design

## Status

Approved during visual brainstorming on 2026-07-16.

Selected visual direction: **Editorial gateway** with the expressive validation and error states from the **Soft atmosphere** option.

## Context

The public catalog, place cards, loading states, and place detail surfaces have already moved from MUI to Tailwind CSS and project-owned shadcn/ui components. The production login route is the next remaining user-facing MUI surface. The development-only auth lab remains outside this slice.

The current login flow already has the correct application boundary:

- `LoginPageContent` owns route-private page composition;
- `LoginForm` is the leaf client component;
- `useActionState` submits to `loginByCredentialsAction`;
- server-side validation returns field errors, a form-level message, and the submitted email;
- the password is never returned to client state;
- successful authentication redirects through the existing normalized `redirectTo` contract.

This slice changes the UI system and visual presentation without changing that authentication flow.

## Goals

1. Remove MUI imports from the production login page and login feature UI.
2. Introduce the complete project-owned shadcn `Field` composition for current and future forms.
3. Preserve server-action behavior, validation rules, redirect behavior, and credential safety.
4. Give the login route a more intentional product-facing visual identity.
5. Make field and form errors clear, accessible, and visually expressive.
6. Replace the changing pending copy `Входим...` with a spinner while keeping the stable button label `Войти`.

## Non-goals

- Migrating `src/app/auth-lab` from MUI.
- Removing the MUI/Emotion bridge or root providers.
- Introducing React Hook Form, TanStack Form, or another client form-state library.
- Changing authentication API calls, cookies, permissions, validation, or redirects.
- Adding password recovery, registration, social login, or password visibility controls.
- Refactoring the catalog `TextField` in the same slice.

## Visual Direction

### Desktop

The login surface becomes a two-column editorial gateway:

- a dark green brand/story panel on the left;
- the login form on a calm light surface on the right;
- a restrained decorative background treatment that does not compete with the form;
- a contained maximum width and generous whitespace rather than a full-bleed dashboard layout.

The story panel contains the product name, a short description of the city catalog, and a Yekaterinburg context label. It is presentation-only and must not contain actions or information required to authenticate.

Approved copy:

- product label: `Стрельчук`;
- story: `Места и материалы о городе — в одном личном пространстве.`;
- context: `Екатеринбург` and `Публичный городской каталог`;
- form heading: `С возвращением`;
- form description: `Войдите, чтобы продолжить работу с местами.`.

### Mobile

The story panel is removed from the layout. Mobile keeps:

- a compact brand mark and product label;
- the same heading, supporting copy, form, errors, and submit action;
- comfortable edge padding and a single-column form-first hierarchy.

No required information may exist only in the hidden desktop story panel.

### Typography and surfaces

The screen uses the existing application tokens and fonts. The migration may improve hierarchy, spacing, surface depth, and decorative composition, but it must not introduce a second global theme or change tokens for unrelated routes.

The form surface should feel precise rather than glass-heavy. Expressiveness belongs primarily in the editorial panel, spacing, focus states, and errors.

## Shared Field System

Add the shadcn `Field` component through the project CLI workflow and keep the project-owned source in `src/shared/ui`.

The public API includes:

- `Field` — wrapper for one form control and its state;
- `FieldGroup` — vertical grouping and spacing for related fields;
- `FieldContent` — optional content wrapper for non-vertical compositions;
- `FieldLabel` — semantic label composition;
- `FieldDescription` — non-error supporting text;
- `FieldError` — one or more validation messages with alert semantics.

The primitives remain form-library agnostic. They receive native props and composition children; they do not know about `useActionState`, the login state model, or a field registration library.

### Invalid state contract

For an invalid field:

- `Field` receives `data-invalid` for group styling;
- the control receives `aria-invalid="true"`;
- `FieldError` renders only when an error exists;
- the control and its error are connected with stable identifiers through `aria-describedby`;
- multiple errors render as a readable list with duplicate messages removed, preserving the shadcn `FieldError` errors-array contract.

The application owns the stable control and message identifiers. The shared `Field` wrapper must not imply that it automatically wires an arbitrary nested control to descriptions or errors.

### Existing TextField

The existing project `TextField` continues to serve the migrated catalog unchanged in this slice. Rebuilding it on top of `Field` would expand login work into a previously verified catalog surface and require a separate parity review.

## Component Boundaries

### `LoginPageContent`

`LoginPageContent` remains a server component and owns only route-private composition:

- semantic `<main>` page boundary;
- shared responsive `Container`;
- desktop editorial panel;
- mobile brand treatment;
- form surface, heading, and supporting copy;
- rendering `LoginForm` with the normalized `redirectTo` value.

It uses shared `Container` and card/surface primitives where they match the approved design. Layout-specific decorative markup remains route-private rather than expanding shared UI.

### `LoginForm`

`LoginForm` remains the leaf client component. It owns:

- `useActionState` integration;
- the hidden `redirectTo` input;
- form-level server feedback;
- field invalid states and error associations;
- pending submit behavior.

Each input is composed explicitly from `Field`, `FieldLabel`, `Input`, and conditional `FieldError`. A login-specific smart `FormField` wrapper is not introduced because it would obscure accessibility wiring and couple shared UI to this state model.

### `LoginSubmitButton`

`LoginSubmitButton` continues to use `useFormStatus`.

While pending:

- the button is disabled;
- a small animated spinner appears before the label;
- the visible label remains `Войти`, preventing width changes and preserving a stable accessible name;
- the spinner is decorative and hidden from assistive technology;
- reduced-motion users receive a non-rotating progress glyph or equivalent reduced animation.

The spinner may be a small local composition using a Lucide loader icon and Tailwind animation. A general-purpose global spinner component is not required unless an existing shared primitive already fits the contract.

## Data Flow and States

### Idle

- Email and password fields are available.
- The submit button is enabled and labelled `Войти`.
- No alert or error message is rendered.

### Validation error

- The corresponding `Field` receives its invalid state.
- The corresponding input receives `aria-invalid` and `aria-describedby`.
- `FieldError` renders the message returned by the server action.
- The submitted email is restored from `state.values.email`.
- The password is not restored.

### Invalid credentials or unexpected failure

- `state.message` renders in a destructive shared `Alert` above the fields.
- The alert uses a clear icon, the fixed title `Не удалось войти`, and `state.message` as its description.
- Field errors are rendered only when `state.fieldErrors` contains them; the UI does not infer which credential was wrong.

### Pending

- The submit button is disabled.
- The label remains `Войти` and a spinner becomes visible.
- Repeat submission is prevented.
- Existing field values remain readable.

### Success

The server action performs the existing redirect. No intermediate success screen or toast is added.

## Accessibility

1. The page contains one `<main>` and one `<h1>`.
2. Every control has an explicit `FieldLabel` associated through `htmlFor` and `id`.
3. Required inputs keep native `required` semantics while the form retains `noValidate` for the server validation contract.
4. Invalid controls expose `aria-invalid` and reference their visible error through `aria-describedby`.
5. Form-level feedback uses the shared alert semantics.
6. Focus rings remain clearly visible against both the form surface and error styling.
7. Keyboard order is email, password, submit with no decorative element entering the tab sequence.
8. Spinner animation respects reduced-motion preferences.
9. Color is not the only indicator of an error: border, icon, and text are present.

## Responsive Behavior

- At the Tailwind `lg` breakpoint and above, the editorial panel and form render as two coordinated columns.
- Below `lg`, the editorial panel is hidden and the route uses the form-first composition.
- Mobile hides the nonessential story panel and keeps a compact brand header.
- Form controls and the submit action remain full width on narrow screens.
- Error content may wrap without overlapping controls or changing the page width.
- Long localized messages must expand the form vertically rather than truncate.

## Testing Contract

### Shared Field tests

Cover:

- public slots and semantic elements;
- vertical group composition;
- `data-invalid` styling hook;
- error alert semantics;
- a single error;
- multiple errors and duplicate-message normalization through the preserved shadcn errors-array contract.

### Login form tests

Cover:

- hidden `redirectTo` value;
- email restoration from action state;
- password not being restored from action state;
- field invalid attributes and error associations;
- form-level destructive alert;
- pending button disabled state;
- spinner presence with stable visible button label;
- absence of pending copy `Входим...`.

### Login page tests

Cover:

- semantic `main` and single `h1`;
- approved heading and supporting copy;
- editorial panel content on the server-rendered page;
- form composition without a new page-level client boundary.

### Visual and interaction checks

Capture and inspect:

- desktop idle login;
- desktop field-error and form-error login;
- desktop pending login;
- mobile idle login;
- mobile field-error login;
- keyboard focus states;
- one representative legacy MUI auth-lab route while the bridge remains.

## Migration Documentation

Update `docs/architecture/mui-to-shadcn-migration-plan.md` after implementation:

- mark production login as completed in Phase 3;
- record the shared Field contract;
- leave auth-lab/debug surfaces as the remaining MUI UI work;
- keep Phase 5 bridge removal blocked until auth-lab and provider dependencies are resolved.

## Expected Files

The implementation is expected to touch:

- `src/shared/ui/field.tsx`;
- `src/shared/ui/index.ts`;
- focused shared Field tests;
- `src/features/auth-login/ui/login-form.tsx`;
- focused login form tests;
- `src/app/login/_components/login-page-content.tsx`;
- focused login page tests;
- `docs/architecture/mui-to-shadcn-migration-plan.md`.

Exact test filenames may follow the existing colocated repository conventions.

## Acceptance Criteria

1. No MUI imports remain under `src/app/login` or `src/features/auth-login/ui`.
2. The approved editorial desktop and form-first mobile layouts are implemented.
3. Field and form errors are visually expressive and satisfy the accessibility contract.
4. Pending submit uses a spinner and stable `Войти` label; `Входим...` is absent.
5. Login server action, validation, email restoration, password handling, and redirects behave unchanged.
6. Shared Field primitives are reusable and independent from login state and external form libraries.
7. Desktop/mobile visual checks and the legacy auth-lab smoke check pass.
8. Focused checks, full lint, unit tests, typecheck, build, and `git diff --check` pass before the implementation PR is considered ready.

## Risks and Constraints

- This is an explicitly approved visual improvement, so strict pixel parity with the old MUI login is not required. Behavioral and accessibility parity is required.
- The editorial copy must remain concise and factual; implementation should not invent product capabilities.
- Generated shadcn source may need token-level adaptation to the repository style, but its composition and accessible semantics should remain recognizable.
- MUI providers and packages remain until the separate auth-lab migration and final bridge-removal phase.
