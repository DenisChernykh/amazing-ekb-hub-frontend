import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';

const temporaryDirectories: string[] = [];

afterEach(async () => {
  await Promise.all(
    temporaryDirectories.splice(0).map((directory) =>
      rm(directory, {
        force: true,
        recursive: true,
      }),
    ),
  );
});

describe('clean-dev-typegen-cache script', () => {
  it('removes both dev and generated route type caches', async () => {
    const temporaryProject = await mkdtemp(join(tmpdir(), 'next-typegen-cleanup-'));
    temporaryDirectories.push(temporaryProject);

    const devTypes = join(temporaryProject, '.next/dev/types');
    const generatedTypes = join(temporaryProject, '.next/types');

    await mkdir(devTypes, { recursive: true });
    await mkdir(generatedTypes, { recursive: true });
    await writeFile(join(devTypes, 'stale.ts'), 'export {};');
    await writeFile(join(generatedTypes, 'stale.ts'), 'export {};');

    const result = spawnSync(
      process.execPath,
      [resolve(process.cwd(), 'scripts/next/clean-dev-typegen-cache.mjs')],
      {
        cwd: temporaryProject,
        encoding: 'utf8',
      },
    );

    expect(result.status, result.stderr).toBe(0);
    expect(existsSync(join(temporaryProject, '.next/dev'))).toBe(false);
    expect(existsSync(generatedTypes)).toBe(false);
  });
});
