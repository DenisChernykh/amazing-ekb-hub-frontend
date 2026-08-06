import jsdoc from 'eslint-plugin-jsdoc';
import tsdoc from 'eslint-plugin-tsdoc';
import { defineConfig } from 'eslint/config';

import baseConfig from './eslint.config.mjs';

const generatedFiles = ['**/*.generated.ts', '**/*.generated.tsx', '**/*.d.ts'];
const orvalGeneratedFiles = [
  'src/shared/api/generated/**/*.{ts,tsx}',
  'src/shared/api/generated-zod/**/*.{ts,tsx}',
];
const exportedApiContexts = [
  'ExportDefaultDeclaration[declaration.type="FunctionDeclaration"]',
  'ExportNamedDeclaration[declaration.type="FunctionDeclaration"]',
  'ExportNamedDeclaration[declaration.type="ClassDeclaration"]',
  'ExportNamedDeclaration[declaration.type="TSInterfaceDeclaration"]',
  'ExportNamedDeclaration[declaration.type="TSTypeAliasDeclaration"]',
  'ExportNamedDeclaration[declaration.type="TSEnumDeclaration"]',
  'ExportNamedDeclaration[declaration.type="VariableDeclaration"]',
];

const documentationRules = {
  'tsdoc/syntax': 'warn',
  'jsdoc/require-jsdoc': [
    'warn',
    {
      contexts: exportedApiContexts,
      require: {
        FunctionDeclaration: false,
      },
      exemptEmptyFunctions: false,
      enableFixer: false,
    },
  ],
  'jsdoc/require-description': 'warn',
};

export default defineConfig([
  ...baseConfig,
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
    rules: documentationRules,
  },
  {
    files: ['src/app/**/*.{ts,tsx}'],
    ignores: generatedFiles,
    plugins: {
      tsdoc,
      jsdoc,
    },
    settings: {
      jsdoc: {
        mode: 'typescript',
      },
    },
    rules: documentationRules,
  },
]);
