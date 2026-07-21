import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

describe('production deployment contract', () => {
  it('injects the cache revalidation secret into the frontend container at runtime', () => {
    const workflow = readFileSync(
      resolve(process.cwd(), '.github/workflows/deploy-production.yml'),
      'utf8',
    );

    expect(workflow).toContain(
      'CACHE_REVALIDATION_SECRET: ${{ secrets.CACHE_REVALIDATION_SECRET }}',
    );
    expect(workflow).toContain('test -n "${CACHE_REVALIDATION_SECRET}"');
    expect(workflow).toContain('if [ "${#CACHE_REVALIDATION_SECRET}" -lt 32 ]; then');
    expect(workflow).toContain(
      '::error::CACHE_REVALIDATION_SECRET must contain at least 32 characters.',
    );
    expect(workflow).toContain('FRONTEND_COMPOSE_OVERRIDE_PATH');
    expect(workflow).toContain(
      'CACHE_REVALIDATION_SECRET: ${CACHE_REVALIDATION_SECRET:?CACHE_REVALIDATION_SECRET is required}',
    );
    expect(workflow).toContain(
      '-f "${FRONTEND_COMPOSE_OVERRIDE_PATH}" --profile apps up -d frontend',
    );
  });
});
