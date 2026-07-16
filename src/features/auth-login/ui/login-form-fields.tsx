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
import { buildLoginEmailInputKey } from '../lib/build-login-email-input-key';

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
            key={buildLoginEmailInputKey(state.values.email)}
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
