import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const readProjectFile = (path: string): string =>
  readFileSync(resolve(process.cwd(), path), 'utf8');

describe('completed MUI bridge removal', () => {
  it('has no auth-lab route or runtime MUI bridge', () => {
    expect(existsSync(resolve(process.cwd(), 'src/app/auth-lab/page.tsx'))).toBe(false);
    expect(existsSync(resolve(process.cwd(), 'src/shared/ui/theme/index.ts'))).toBe(false);

    const runtimeSource = [
      readProjectFile('src/app/layout.tsx'),
      readProjectFile('src/app/providers.tsx'),
    ].join('\n');
    const globalCss = readProjectFile('src/app/globals.css');

    expect(runtimeSource).not.toMatch(
      /@mui|@emotion|AppRouterCacheProvider|ThemeProvider|CssBaseline/,
    );
    expect(globalCss).not.toContain('@layer theme, base, mui, components, utilities;');
    expect(globalCss).not.toContain('.MuiInputBase-input');
  });
});
