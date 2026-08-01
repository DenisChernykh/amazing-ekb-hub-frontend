import { spawnSync } from 'node:child_process';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { afterEach, describe, expect, it } from 'vitest';

const syncScriptPath = fileURLToPath(new URL('../scripts/api/sync-openapi.mjs', import.meta.url));
const temporaryDirectories: string[] = [];

async function createTemporaryDirectory(): Promise<string> {
  const directory = await mkdtemp(resolve(tmpdir(), 'openapi-sync-contract-'));
  temporaryDirectories.push(directory);
  return directory;
}

function syncOpenApi(directory: string, source: string) {
  return spawnSync(process.execPath, [syncScriptPath], {
    cwd: directory,
    encoding: 'utf8',
    env: {
      ...process.env,
      OPENAPI_SPEC_OUTPUT: 'openapi.json',
      OPENAPI_SPEC_SOURCE: source,
    },
  });
}

afterEach(async () => {
  await Promise.all(
    temporaryDirectories
      .splice(0)
      .map((directory) => rm(directory, { force: true, recursive: true })),
  );
});

describe('sync-openapi CLI contract', () => {
  it('persists a local JSON source byte-for-byte', async () => {
    const directory = await createTemporaryDirectory();
    const sourcePath = resolve(directory, 'source.json');
    const source = '{\n  "openapi": "3.1.0",\n  "info": {},\n  "paths": {}\n}';
    await writeFile(sourcePath, source);

    const result = syncOpenApi(directory, sourcePath);

    expect(result.status).toBe(0);
    await expect(readFile(resolve(directory, 'openapi.json'), 'utf8')).resolves.toBe(source);
  });

  it('rejects invalid JSON without overwriting an existing snapshot', async () => {
    const directory = await createTemporaryDirectory();
    const sourcePath = resolve(directory, 'invalid.json');
    const outputPath = resolve(directory, 'openapi.json');
    await writeFile(sourcePath, '{ invalid JSON');
    await writeFile(outputPath, 'existing snapshot');

    const result = syncOpenApi(directory, sourcePath);

    expect(result.status).not.toBe(0);
    expect(result.stderr).toContain('OpenAPI source is not valid JSON');
    await expect(readFile(outputPath, 'utf8')).resolves.toBe('existing snapshot');
  });

  it.each(['openapi', 'info', 'paths'])('rejects a document missing %s', async (missingKey) => {
    const directory = await createTemporaryDirectory();
    const sourcePath = resolve(directory, 'missing-field.json');
    const document = {
      openapi: '3.1.0',
      info: {},
      paths: {},
    };
    delete document[missingKey as keyof typeof document];
    await writeFile(sourcePath, JSON.stringify(document));

    const result = syncOpenApi(directory, sourcePath);

    expect(result.status).not.toBe(0);
    expect(result.stderr).toContain('OpenAPI source must contain openapi, info and paths');
  });
});
