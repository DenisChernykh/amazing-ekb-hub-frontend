/**
 * Это хелпер. Строит remount key для uncontrolled email input по server-owned default.
 *
 * @param email - Email из состояния server action.
 * @returns Стабильный key, меняющийся вместе с default email.
 */
export function buildLoginEmailInputKey(email: string): string {
  return `email=${email}`;
}
