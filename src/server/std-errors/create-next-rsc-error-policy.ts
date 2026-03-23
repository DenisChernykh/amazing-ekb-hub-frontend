import { createDefaultStdErrorPolicy } from '@/lib/std-errors/policy';
import type { StdErrorPolicy, StdErrorPolicyRule } from '@/lib/std-errors/types';

/**
 * Описывает high-level режим обработки `auth` и `permission` ошибок в Next RSC.
 */
export type NextRscAccessFailureMode = 'inline' | 'redirect' | 'interrupt';

/**
 * Описывает настройки одного access-related expected failure.
 */
export interface NextRscAccessFailureOptions {
  /**
   * Режим обработки expected failure.
   *
   * @remarks
   * `interrupt` для `auth` и `permission` работает только при включённом `authInterrupts`.
   */
  mode?: NextRscAccessFailureMode;

  /**
   * Ключ project-level каталога сообщений.
   */
  catalogKey?: string;

  /**
   * URL назначения для режима `redirect`.
   */
  redirectTo?: string;
}

/**
 * Описывает настройки expected failure без redirect/interrupt логики.
 */
export interface NextRscInlineFailureOptions {
  /**
   * Ключ project-level каталога сообщений.
   */
  catalogKey?: string;
}

/**
 * Описывает настройки `not_found` ошибки в Next RSC policy.
 */
export interface NextRscNotFoundFailureOptions {
  /**
   * Режим обработки `not_found`.
   *
   * @remarks
   * Для `not_found` доступны только `inline` и `interrupt`.
   */
  mode?: 'inline' | 'interrupt';

  /**
   * Ключ project-level каталога сообщений.
   */
  catalogKey?: string;
}

/**
 * Описывает входные опции для сборки Next-aware policy поверх `core`.
 */
export interface CreateNextRscErrorPolicyOptions {
  /**
   * Включён ли в приложении experimental `authInterrupts`.
   *
   * @remarks
   * Если `false`, режим `interrupt` для `auth` и `permission` автоматически
   * деградирует к `inline`.
   */
  authInterrupts?: boolean;

  /**
   * Дополнительные project-specific правила по envelope-level кодам ошибок.
   */
  byCode?: Partial<Record<string, StdErrorPolicyRule>>;

  /**
   * Настройки для `validation` expected failure.
   */
  validation?: NextRscInlineFailureOptions;

  /**
   * Настройки для `domain` expected failure.
   */
  domain?: NextRscInlineFailureOptions;

  /**
   * Настройки для `auth` expected failure.
   */
  auth?: NextRscAccessFailureOptions;

  /**
   * Настройки для `permission` expected failure.
   */
  permission?: NextRscAccessFailureOptions;

  /**
   * Настройки для `not_found` expected failure.
   */
  notFound?: NextRscNotFoundFailureOptions;
}

/**
 * Создаёт project-ready policy для Next Server Components.
 *
 * @param options - Runtime-capabilities и project overrides.
 * @returns Готовая `StdErrorPolicy`, совместимая с `executeRscRequest()`.
 *
 * @remarks
 * Helper остаётся thin-слоем поверх `core` и не зависит от route segment или UI.
 * Его задача — выразить platform-aware defaults для Next RSC без ручной сборки policy.
 */
export function createNextRscErrorPolicy(
  options: CreateNextRscErrorPolicyOptions = {},
): StdErrorPolicy {
  const authInterrupts = options.authInterrupts ?? false;

  return createDefaultStdErrorPolicy({
    byCode: options.byCode,
    byType: {
      validation: {
        action: 'inline',
        catalogKey: options.validation?.catalogKey ?? 'std.validation.generic',
      },
      domain: {
        action: 'inline',
        catalogKey: options.domain?.catalogKey ?? 'std.domain.generic',
      },
      auth: createAccessFailureRule({
        authInterrupts,
        interruptAction: 'interrupt:unauthorized',
        defaultCatalogKey: 'std.auth.generic',
        options: options.auth,
        failureType: 'auth',
      }),
      permission: createAccessFailureRule({
        authInterrupts,
        interruptAction: 'interrupt:forbidden',
        defaultCatalogKey: 'std.permission.generic',
        options: options.permission,
        failureType: 'permission',
      }),
      not_found: createNotFoundFailureRule(options.notFound),
    },
  });
}

function createAccessFailureRule(input: {
  authInterrupts: boolean;
  interruptAction: 'interrupt:unauthorized' | 'interrupt:forbidden';
  defaultCatalogKey: string;
  options?: NextRscAccessFailureOptions;
  failureType: 'auth' | 'permission';
}): StdErrorPolicyRule {
  const mode = input.options?.mode ?? 'inline';
  const catalogKey = input.options?.catalogKey ?? input.defaultCatalogKey;

  switch (mode) {
    case 'inline':
      return {
        action: 'inline',
        catalogKey,
      };

    case 'interrupt':
      if (!input.authInterrupts) {
        return {
          action: 'inline',
          catalogKey,
        };
      }

      return {
        action: input.interruptAction,
        catalogKey,
      };

    case 'redirect':
      if (!isNonEmptyString(input.options?.redirectTo)) {
        throw new Error(
          `Missing \`redirectTo\` for \`${input.failureType}\` policy with \`redirect\` mode.`,
        );
      }

      return {
        action: 'redirect',
        catalogKey,
        redirectTo: input.options.redirectTo,
      };
  }
}

function createNotFoundFailureRule(options?: NextRscNotFoundFailureOptions): StdErrorPolicyRule {
  const mode = options?.mode ?? 'interrupt';
  const catalogKey = options?.catalogKey ?? 'std.notFound.generic';

  if (mode === 'inline') {
    return {
      action: 'inline',
      catalogKey,
    };
  }

  return {
    action: 'interrupt:notFound',
    catalogKey,
  };
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}
