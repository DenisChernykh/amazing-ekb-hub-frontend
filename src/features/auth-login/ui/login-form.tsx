'use client';

import { LOGIN_INITIAL_STATE } from '@/features/auth-login/model/login-action-state';
import { Alert, Button, Stack, TextField } from '@mui/material';
import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { loginByCredentialsAction } from '../server/login-by-credentials-action';

interface LoginFormProps {
  redirectTo: string;
}

/**
 * Рендерит кнопку submit с pending-состоянием формы.
 */
function LoginSubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button
      disabled={pending}
      fullWidth
      size="large"
      type="submit"
      variant="contained"
      sx={{
        minHeight: 48,
        fontWeight: 700,
      }}
    >
      {pending ? 'Входим...' : 'Войти'}
    </Button>
  );
}

/**
 * Рендерит форму входа по email и паролю.
 *
 * @remarks
 * Submit обрабатывается server action. Токены не попадают в клиентское состояние.
 */
export function LoginForm({ redirectTo }: Readonly<LoginFormProps>) {
  const [state, formAction] = useActionState(loginByCredentialsAction, LOGIN_INITIAL_STATE);
  const hasMessage = Boolean(state.message);

  return (
    <form action={formAction} noValidate>
      <Stack spacing={2.25}>
        <input name="redirectTo" type="hidden" value={redirectTo} />

        {hasMessage && (
          <Alert severity="error" variant="outlined">
            {state.message}
          </Alert>
        )}

        <TextField
          autoComplete="username"
          defaultValue={state.values.email}
          error={Boolean(state.fieldErrors.email)}
          fullWidth
          helperText={state.fieldErrors.email}
          label="Email"
          name="email"
          required
          type="email"
        />

        <TextField
          autoComplete="current-password"
          error={Boolean(state.fieldErrors.password)}
          fullWidth
          helperText={state.fieldErrors.password}
          label="Пароль"
          name="password"
          required
          type="password"
        />

        <LoginSubmitButton />
      </Stack>
    </form>
  );
}
