import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const missingApiBaseUrlError = '::error::API_BASE_URL repository variable is required.';

function readWorkflow(filename: string): string {
  return readFileSync(resolve(process.cwd(), '.github/workflows', filename), 'utf8');
}

describe('CI API base URL contract', () => {
  it('uses the pinned local backend for pull request builds', () => {
    const workflow = readWorkflow('git-quality.yml');

    expect(workflow).toContain(
      [
        '  validate:',
        '    runs-on: ubuntu-latest',
        '    timeout-minutes: 45',
        '',
        '    env:',
        '      API_BASE_URL: http://127.0.0.1:3000',
      ].join('\n'),
    );
    expect(workflow).toContain('repository: DenisChernykh/amazing-ekb-hub-backend');
    expect(workflow).toContain('ref: 664304d19002aef542e9cef07e202e99e5693725');
    expect(workflow).toContain('path: backend');
    expect(workflow).toContain('BACKEND_REPO_READ_TOKEN');
    expect(workflow).toContain('persist-credentials: false');
    expect(workflow).toContain('docker compose --profile development up');
    expect(workflow).toContain('name: Seed local backend build fixture');
    expect(workflow).toContain(
      'docker compose --project-directory backend --profile development down',
    );
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
});
