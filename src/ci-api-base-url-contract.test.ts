import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const missingApiBaseUrlError = '::error::API_BASE_URL repository variable is required.';

function readWorkflow(filename: string): string {
  return readFileSync(resolve(process.cwd(), '.github/workflows', filename), 'utf8');
}

describe('CI API base URL contract', () => {
  it('runs pull request builds against a frontend-owned localhost fixture', () => {
    const workflow = readWorkflow('git-quality.yml');

    expect(workflow).toContain(
      [
        '  validate:',
        '    runs-on: ubuntu-latest',
        '',
        '    env:',
        '      API_BASE_URL: http://127.0.0.1:3000',
      ].join('\n'),
    );
    expect(workflow).toContain('node ./scripts/ci/catalog-build-fixture-server.mjs');
    expect(workflow).toContain('pnpm run build');
    expect(workflow).not.toContain('api.strelchukgo.ru');
    expect(workflow).not.toContain('amazing-ekb-hub-backend');
    expect(workflow).not.toContain('BACKEND_REPO_READ_TOKEN');
    expect(workflow).not.toContain('docker compose');
    expect(workflow).not.toContain(missingApiBaseUrlError);
  });

  it('passes the repository API_BASE_URL variable to production quality builds', () => {
    const workflow = readWorkflow('deploy-production.yml');

    expect(workflow).toContain(
      [
        '  quality:',
        '    name: Verify frontend before production deploy',
        '    runs-on: ubuntu-latest',
        '',
        '    env:',
        '      API_BASE_URL: ${{ vars.API_BASE_URL }}',
      ].join('\n'),
    );
    expect(workflow).toContain(missingApiBaseUrlError);
  });

  it('keeps the collection build fixture on the optional-cover contract path', () => {
    const fixture = readFileSync(
      resolve(process.cwd(), 'scripts/ci/catalog-build-fixture-server.mjs'),
      'utf8',
    );

    expect(fixture).toContain("'/v1/collections'");
    expect(fixture).toContain('`/v1/collections/${collection.slug}`');
    expect(fixture).toContain('coverImageUrl: null');
    expect(fixture).not.toContain("'/v1/collections/ci-collection/photo'");
  });
});
