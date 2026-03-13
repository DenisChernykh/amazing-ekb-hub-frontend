/**
 * Канонический same-origin базовый путь для backend API.
 *
 * @remarks
 * Frontend обращается к backend через относительный путь `/v1`.
 * В локальной разработке этот путь проксируется Next rewrites из `next.config.ts`.
 */
export const API_BASE_PATH = '/v1';

/**
 * Строит нормализованный путь backend API от `API_BASE_PATH`.
 *
 * @param path - Endpoint path с ведущим `/` или без него.
 * @returns Same-origin путь вида `/v1/...` или `/v1`, если передан пустой путь.
 */
export function buildApiPath(path = ''): string {
  const normalizedPath = path.replace(/^\/+/, '');

  if (normalizedPath.length === 0) {
    return API_BASE_PATH;
  }

  return `${API_BASE_PATH}/${normalizedPath}`;
}
