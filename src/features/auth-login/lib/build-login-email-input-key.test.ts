import { describe, expect, it } from 'vitest';
import { buildLoginEmailInputKey } from './build-login-email-input-key';

describe('buildLoginEmailInputKey', () => {
  it('changes when the server-owned email default changes', () => {
    expect(buildLoginEmailInputKey('')).not.toBe(buildLoginEmailInputKey('visitor@example.com'));
  });
});
