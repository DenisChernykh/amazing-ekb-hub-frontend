/**
 * Статус server action для формы логина.
 */
export type LoginActionStatus =
  | 'idle'
  | 'validation_error'
  | 'invalid_credentials'
  | 'unexpected_error';

/**
 * Поля формы логина, для которых action может вернуть локальную ошибку.
 */
export type LoginFieldName = 'email' | 'password';

/**
 * Ошибки полей формы логина.
 */
export type LoginFieldErrors = Partial<Record<LoginFieldName, string>>;

/**
 * Сериализуемое состояние формы логина.
 *
 * @remarks
 * В `user` попадает только безопасная session model без токенов.
 */
export interface LoginByCredentialsState {
  status: LoginActionStatus;
  message: string | null;
  fieldErrors: LoginFieldErrors;
  values: {
    email: string;
  };
}

/**
 * Начальное состояние server action для формы логина.
 */
export const LOGIN_INITIAL_STATE: LoginByCredentialsState = {
  status: 'idle',
  message: null,
  fieldErrors: {},
  values: {
    email: '',
  },
};
