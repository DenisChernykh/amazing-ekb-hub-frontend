import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const readProjectFile = (path: string): string =>
  readFileSync(resolve(process.cwd(), path), 'utf8');

describe('completed MUI bridge removal', () => {
  it('has no auth-lab route or runtime MUI bridge', () => {
    expect(existsSync(resolve(process.cwd(), 'src/app/auth-lab/page.tsx'))).toBe(false);
    expect(existsSync(resolve(process.cwd(), 'src/shared/ui/theme/index.ts'))).toBe(false);

    const runtimeSource = readProjectFile('src/app/layout.tsx');
    const globalCss = readProjectFile('src/app/globals.css');

    expect(runtimeSource).not.toMatch(
      /@mui|@emotion|AppRouterCacheProvider|ThemeProvider|CssBaseline/,
    );
    expect(globalCss).not.toContain('@layer theme, base, mui, components, utilities;');
    expect(globalCss).not.toContain('.MuiInputBase-input');
  });

  it('has no direct MUI or Emotion dependencies', () => {
    const packageJson = JSON.parse(readProjectFile('package.json')) as {
      dependencies?: Record<string, string>;
    };
    const dependencies = packageJson.dependencies ?? {};

    for (const dependency of [
      '@emotion/cache',
      '@emotion/react',
      '@emotion/styled',
      '@mui/material',
      '@mui/material-nextjs',
    ]) {
      expect(dependencies).not.toHaveProperty(dependency);
    }
  });
});
