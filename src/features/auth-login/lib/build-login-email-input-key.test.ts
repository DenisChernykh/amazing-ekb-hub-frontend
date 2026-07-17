import { describe, expect, it } from 'vitest';
import { buildLoginEmailInputKey } from './build-login-email-input-key';

describe('buildLoginEmailInputKey', () => {
  const email = 'visitor@example.com';

  it('returns the same key for the same email', () => {
    expect(buildLoginEmailInputKey(email)).toBe(buildLoginEmailInputKey(email));
  });

  it('returns a different key when the email changes', () => {
    expect(buildLoginEmailInputKey(email)).not.toBe(buildLoginEmailInputKey('editor@example.com'));
  });

  it('builds the expected deterministic key', () => {
    expect(buildLoginEmailInputKey(email)).toBe('email=visitor@example.com');
  });
});
