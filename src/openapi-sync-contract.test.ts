import { spawnSync } from 'node:child_process';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { afterEach, describe, expect, it } from 'vitest';

const syncScriptPath = fileURLToPath(new URL('../scripts/api/sync-openapi.mjs', import.meta.url));
const temporaryDirectories: string[] = [];

function createValidOpenApiDocument() {
  return {
    openapi: '3.1.0',
    info: {},
    paths: {
      '/v1/collections': { get: { operationId: 'collectionsList' } },
      '/v1/collections/{collectionSlug}': { get: { operationId: 'collectionsGet' } },
      '/v1/collections/{collectionSlug}/photo': { get: { operationId: 'collectionsGetPhoto' } },
    },
    components: {
      schemas: {
        PublicCollectionDetailResponseDto: {
          properties: {
            items: {
              items: { $ref: '#/components/schemas/PublicPlaceSummaryResponseDto' },
            },
          },
        },
      },
    },
  };
}

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
    const source = JSON.stringify(createValidOpenApiDocument(), null, 2);
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

  it.each(['collectionsList', 'collectionsGet', 'collectionsGetPhoto'])(
    'rejects a document missing the %s operation',
    async (operationId) => {
      const directory = await createTemporaryDirectory();
      const sourcePath = resolve(directory, 'missing-operation.json');
      const document = createValidOpenApiDocument();
      const pathItems = document.paths as Record<string, Record<string, { operationId?: string }>>;

      for (const [path, methods] of Object.entries(pathItems)) {
        for (const [method, operation] of Object.entries(methods)) {
          if (operation.operationId === operationId) {
            delete pathItems[path][method];
          }
        }
      }

      await writeFile(sourcePath, JSON.stringify(document));

      const result = syncOpenApi(directory, sourcePath);

      expect(result.status).not.toBe(0);
      expect(result.stderr).toContain(`OpenAPI source must expose ${operationId}`);
    },
  );

  it('rejects collection detail items that do not use the canonical place summary schema', async () => {
    const directory = await createTemporaryDirectory();
    const sourcePath = resolve(directory, 'wrong-collection-items.json');
    const document = createValidOpenApiDocument();
    document.components.schemas.PublicCollectionDetailResponseDto.properties.items.items.$ref =
      '#/components/schemas/CollectionPublicPlaceSummaryResponseDto';
    await writeFile(sourcePath, JSON.stringify(document));

    const result = syncOpenApi(directory, sourcePath);

    expect(result.status).not.toBe(0);
    expect(result.stderr).toContain(
      'OpenAPI source must use PublicPlaceSummaryResponseDto for collection detail items',
    );
  });
});
