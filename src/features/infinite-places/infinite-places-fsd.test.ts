import { readFileSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const FEATURE_ROOT = dirname(fileURLToPath(import.meta.url));

/** Рекурсивно собирает production TypeScript-файлы feature-slice. */
function collectSourceFiles(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);

    if (entry.isDirectory()) return collectSourceFiles(path);
    return /\.[cm]?tsx?$/.test(entry.name) && !entry.name.includes('.test.') ? [path] : [];
  });
}

describe('infinite-places FSD boundary', () => {
  it('does not import the widgets layer from a feature', () => {
    const source = collectSourceFiles(FEATURE_ROOT)
      .map((path) => readFileSync(path, 'utf8'))
      .join('\n');

    expect(source).not.toMatch(/from ['"]@\/widgets\//);
  });
});
