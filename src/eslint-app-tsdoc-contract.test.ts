import { ESLint } from 'eslint';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

describe('ESLint app TSDoc contract', () => {
  it('requires documentation for handwritten route-layer exports', async () => {
    const eslint = new ESLint({
      cwd: process.cwd(),
      overrideConfigFile: resolve(process.cwd(), 'eslint.tsdoc.config.mjs'),
    });
    const [result] = await eslint.lintText(
      [
        'export function undocumentedRouteHelper() {}',
        'export default function UndocumentedPage() {}',
      ].join('\n'),
      {
        filePath: resolve(process.cwd(), 'src/app/undocumented/page.tsx'),
      },
    );

    const documentationMessages = result.messages.filter(
      ({ ruleId }) => ruleId === 'jsdoc/require-jsdoc',
    );

    expect(documentationMessages).toHaveLength(2);
    expect(documentationMessages.every(({ severity }) => severity === 1)).toBe(true);
  });
});
