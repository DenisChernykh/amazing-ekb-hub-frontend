import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const missingApiBaseUrlError = '::error::API_BASE_URL repository variable is required.';

function readWorkflow(filename: string): string {
  return readFileSync(resolve(process.cwd(), '.github/workflows', filename), 'utf8');
}

describe('CI API base URL contract', () => {
  it('passes the repository API_BASE_URL variable to pull request builds', () => {
    const workflow = readWorkflow('git-quality.yml');

    expect(workflow).toContain(
      [
        '  validate:',
        '    runs-on: ubuntu-latest',
        '',
        '    env:',
        '      API_BASE_URL: ${{ vars.API_BASE_URL }}',
      ].join('\n'),
    );
    expect(workflow).toContain(missingApiBaseUrlError);
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
