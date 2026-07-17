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
 * Рендерит форму входа по email и паролю.
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
