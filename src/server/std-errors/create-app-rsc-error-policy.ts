import type { StdErrorPolicy } from '@/lib/std-errors';
import {
  createNextRscErrorPolicy,
  type CreateNextRscErrorPolicyOptions,
} from './create-next-rsc-error-policy';

/**
 * Входные опции app-level policy для Next Server Components.
 *
 * @remarks
 * Это тонкий app-слой поверх `createNextRscErrorPolicy()`.
 * Все RSC-страницы приложения должны импортировать policy именно отсюда,
 * чтобы проект держал единый стандарт expected/fatal flow.
 */
export type CreateAppRscErrorPolicyOptions = CreateNextRscErrorPolicyOptions;

/**
 * Создает app-level policy для `std-errors` в Next Server Components.
 *
 * @param options - Частичные project-level overrides.
 * @returns Готовая policy-конфигурация для RSC-страниц приложения.
 */
export function createAppRscErrorPolicy(
  options: CreateAppRscErrorPolicyOptions = {},
): StdErrorPolicy {
  return createNextRscErrorPolicy(options);
}
