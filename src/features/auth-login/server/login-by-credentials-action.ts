'use server';

import { setSessionCookies } from '@/entities/session/server';
import { LoginBody } from '@/shared/api/generated-zod/auth/auth.zod';
import { login } from '@/shared/api/generated/auth/auth';
import { getAuthAccessFailureKind } from '@/shared/lib/api/auth-access-policy';
import { isGeneratedApiError } from '@/shared/lib/api/is-generated-api-error';
import { redirect } from 'next/navigation';
import { normalizeLoginRedirect } from '../lib/normalize-login-redirect';
import type {
  LoginByCredentialsState,
  LoginFieldErrors,
  LoginFieldName,
} from '../model/login-action-state';

/**
 * Это хелпер для безопасного чтения строкового поля из `FormData`.
 *
 * @param formData - Данные HTML-формы.
 * @param name - Имя поля логина.
 * @returns Строковое значение поля или пустая строка.
 */
function getStringFormValue(formData: FormData, name: LoginFieldName): string {
  const value = formData.get(name);

  if (typeof value !== 'string') {
    return '';
  }

  return name === 'email' ? value.trim() : value;
}

/**
 * Это хелпер для сборки validation state формы логина.
 *
 * @param email - Email, который можно безопасно вернуть в форму.
 * @param fieldErrors - Локальные ошибки конкретных полей.
 * @returns Сериализуемое состояние ошибки валидации.
 */
function buildValidationState(
  email: string,
  fieldErrors: LoginFieldErrors,
): LoginByCredentialsState {
  return {
    status: 'validation_error',
    message: 'Проверьте email и пароль.',
    fieldErrors,
    values: {
      email,
    },
  };
}

/**
 * Это хелпер для перевода Zod issues в локальные field errors.
 *
 * @param issues - Ошибки generated Zod-схемы.
 * @returns Ошибки полей с UI-текстами frontend слоя.
 */
function mapValidationIssues(
  issues: readonly { path: readonly PropertyKey[] }[],
): LoginFieldErrors {
  const fieldErrors: LoginFieldErrors = {};

  for (const issue of issues) {
    const fieldName = issue.path[0];

    if (fieldName === 'email') {
      fieldErrors.email = 'Введите корректный email.';
    }

    if (fieldName === 'password') {
      fieldErrors.password = 'Пароль должен быть не короче 8 символов.';
    }
  }

  return fieldErrors;
}

/**
 * Выполняет login по email и паролю через backend auth API.
 *
 * @remarks
 * Action ставит HttpOnly cookies и завершает успешный flow серверным redirect.
 * Raw backend messages не используются для UI.
 *
 * @param _previousState - Предыдущее состояние `useActionState`.
 * @param formData - Данные HTML-формы логина.
 * @returns Сериализуемое состояние формы логина.
 */
export async function loginByCredentialsAction(
  _previousState: LoginByCredentialsState,
  formData: FormData,
): Promise<LoginByCredentialsState> {
  const email = getStringFormValue(formData, 'email');
  const password = getStringFormValue(formData, 'password');
  const redirectToValue = formData.get('redirectTo');
  const redirectTo = normalizeLoginRedirect(
    typeof redirectToValue === 'string' ? redirectToValue : undefined,
  );
  const validation = LoginBody.safeParse({ email, password });

  if (!validation.success) {
    return buildValidationState(email, mapValidationIssues(validation.error.issues));
  }

  let tokenResponse: Awaited<ReturnType<typeof login>>;

  try {
    tokenResponse = await login(validation.data, {
      cache: 'no-store',
    });
  } catch (error) {
    if (isGeneratedApiError(error)) {
      const accessFailureKind = getAuthAccessFailureKind(error.status);

      if (accessFailureKind === 'unauthenticated') {
        return {
          status: 'invalid_credentials',
          message: 'Неверный логин или пароль.',
          fieldErrors: {},
          values: {
            email,
          },
        };
      }

      if (error.status === 400) {
        return buildValidationState(email, {});
      }
    }

    return {
      status: 'unexpected_error',
      message: 'Не удалось выполнить вход. Попробуйте ещё раз.',
      fieldErrors: {},
      values: {
        email,
      },
    };
  }

  await setSessionCookies(tokenResponse.data);
  redirect(redirectTo);
}
