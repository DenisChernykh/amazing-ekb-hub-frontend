import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

describe('completed auth/session removal', () => {
  it('has no handwritten auth/session runtime or login route', () => {
    for (const path of [
      'src/app/providers.tsx',
      'src/app/login',
      'src/features/auth-login',
      'src/entities/session',
    ]) {
      expect(existsSync(resolve(process.cwd(), path))).toBe(false);
    }

    const layout = readFileSync(resolve(process.cwd(), 'src/app/layout.tsx'), 'utf8');

    expect(layout).not.toMatch(/getCurrentSession|SessionProvider|<Providers/);
  });
});
