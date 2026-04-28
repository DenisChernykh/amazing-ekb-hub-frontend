import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';
import prettier from 'eslint-config-prettier';
import jsdoc from 'eslint-plugin-jsdoc';
import tsdoc from 'eslint-plugin-tsdoc';
import { defineConfig, globalIgnores } from 'eslint/config';

const generatedFiles = ['**/*.generated.ts', '**/*.generated.tsx', '**/*.d.ts'];

const orvalGeneratedFiles = [
  'src/shared/api/generated/**/*.{ts,tsx}',
  'src/shared/api/generated-zod/**/*.{ts,tsx}',
];
const exportedApiContexts = [
  'ExportNamedDeclaration[declaration.type="FunctionDeclaration"]',
  'ExportNamedDeclaration[declaration.type="ClassDeclaration"]',
  'ExportNamedDeclaration[declaration.type="TSInterfaceDeclaration"]',
  'ExportNamedDeclaration[declaration.type="TSTypeAliasDeclaration"]',
  'ExportNamedDeclaration[declaration.type="TSEnumDeclaration"]',
  'ExportNamedDeclaration[declaration.type="VariableDeclaration"]',
];

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,

  globalIgnores([
    '.next/**',
    'out/**',
    'build/**',
    'next-env.d.ts',
    'coverage/**',
    ...orvalGeneratedFiles,
  ]),

  {
    files: ['src/**/*.{ts,tsx}'],
    ignores: ['src/app/**/*.{ts,tsx}', ...generatedFiles, ...orvalGeneratedFiles],
    plugins: {
      tsdoc,
      jsdoc,
    },
    settings: {
      jsdoc: {
        mode: 'typescript',
      },
    },
    rules: {
      'tsdoc/syntax': 'error',

      'jsdoc/require-jsdoc': [
        'warn',
        {
          contexts: exportedApiContexts,
          exemptEmptyFunctions: false,
          enableFixer: false,
        },
      ],
      'jsdoc/require-description': 'warn',
    },
  },

  {
    files: ['src/app/**/*.{ts,tsx}'],
    ignores: generatedFiles,
    plugins: {
      tsdoc,
    },
    rules: {
      'tsdoc/syntax': 'error',
    },
  },

  prettier,
]);

export default eslintConfig;
