import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';
import prettier from 'eslint-config-prettier';
import { defineConfig, globalIgnores } from 'eslint/config';

const orvalGeneratedFiles = [
  'src/shared/api/generated/**/*.{ts,tsx}',
  'src/shared/api/generated-zod/**/*.{ts,tsx}',
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

  prettier,
]);

export default eslintConfig;
