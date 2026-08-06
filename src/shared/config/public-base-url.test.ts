import { afterEach, describe, expect, it, vi } from 'vitest';
import { getPublicBaseUrl, PUBLIC_BASE_URL_CONFIGURATION_ERROR } from './public-base-url';

describe('getPublicBaseUrl', () => {
  afterEach(() => vi.unstubAllEnvs());

  it.each([
    ['https://www.example.test', 'https://www.example.test/'],
    ['https://www.example.test/', 'https://www.example.test/'],
    ['http://localhost:3001///', 'http://localhost:3001/'],
  ])('normalizes valid origin %s', (value, expected) => {
    vi.stubEnv('PUBLIC_BASE_URL', value);

    expect(getPublicBaseUrl()).toBe(expected);
  });

  it.each([
    'ftp://www.example.test',
    'https://user:password@www.example.test',
    'https://www.example.test/path',
    'https://www.example.test?query=1',
    'https://www.example.test#fragment',
    'not-an-url',
  ])('rejects invalid public origin %s', (value) => {
    vi.stubEnv('PUBLIC_BASE_URL', value);

    expect(() => getPublicBaseUrl()).toThrow(PUBLIC_BASE_URL_CONFIGURATION_ERROR);
  });

  it('uses the local public frontend fallback when a non-production value is missing', () => {
    vi.stubEnv('NODE_ENV', 'test');
    vi.stubEnv('PUBLIC_BASE_URL', '');

    expect(getPublicBaseUrl()).toBe('http://localhost:3001/');
  });

  it('fails deterministically when production value is missing', () => {
    vi.stubEnv('NODE_ENV', 'production');
    vi.stubEnv('PUBLIC_BASE_URL', '');

    expect(() => getPublicBaseUrl()).toThrow(PUBLIC_BASE_URL_CONFIGURATION_ERROR);
  });

  it('fails deterministically when production value is invalid', () => {
    vi.stubEnv('NODE_ENV', 'production');
    vi.stubEnv('PUBLIC_BASE_URL', 'http://localhost:3001/app');

    expect(() => getPublicBaseUrl()).toThrow(PUBLIC_BASE_URL_CONFIGURATION_ERROR);
  });
});
