const LOCAL_PUBLIC_BASE_URL = 'http://localhost:3001/';

/** Deterministic safe error for invalid production public-origin configuration. */
export const PUBLIC_BASE_URL_CONFIGURATION_ERROR =
  'PUBLIC_BASE_URL must be an absolute HTTP(S) origin without credentials, query, fragment, or path.';

function parsePublicBaseUrl(value: string): string {
  const valueWithoutTrailingSlashes = value.replace(/\/+$/, '');
  let url: URL;

  try {
    url = new URL(valueWithoutTrailingSlashes || value);
  } catch {
    throw new Error(PUBLIC_BASE_URL_CONFIGURATION_ERROR);
  }

  if (
    (url.protocol !== 'http:' && url.protocol !== 'https:') ||
    url.username ||
    url.password ||
    url.pathname !== '/' ||
    /[?#]/.test(value)
  ) {
    throw new Error(PUBLIC_BASE_URL_CONFIGURATION_ERROR);
  }

  return `${url.origin}/`;
}

/**
 * Resolves the server-only public frontend origin used by Next metadata.
 *
 * Missing local/test configuration uses the deterministic local frontend origin.
 * Production never falls back to localhost and throws a safe configuration error.
 */
export function getPublicBaseUrl(): string {
  const configuredValue = process.env.PUBLIC_BASE_URL?.trim();

  if (!configuredValue) {
    if (process.env.NODE_ENV !== 'production') return LOCAL_PUBLIC_BASE_URL;

    throw new Error(PUBLIC_BASE_URL_CONFIGURATION_ERROR);
  }

  return parsePublicBaseUrl(configuredValue);
}
