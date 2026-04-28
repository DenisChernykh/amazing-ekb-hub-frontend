import { defineConfig } from 'orval';

/**
 * Генерация typed fetch-клиента и отдельных Zod-схем из локального OpenAPI snapshot.
 *
 * @remarks
 * Здесь генерация разделена на два output:
 * - HTTP client для transport-уровня
 * - Zod schemas для runtime contract validation
 *
 * Такой split-режим проще и стабильнее, чем попытка заставить один output
 * одновременно быть и fetch client, и полным источником runtime schemas.
 */
export default defineConfig({
  amazingEkbHub: {
    input: {
      target: './openapi.json',
    },
    output: {
      target: './src/shared/api/generated/index.ts',
      schemas: './src/shared/api/generated/model',
      operationSchemas: './src/shared/api/generated/operation',
      client: 'fetch',
      mode: 'tags-split',
      clean: true,
      baseUrl: {
        runtime: 'process.env.API_BASE_URL',
      },
      urlEncodeParameters: true,
      override: {
        useNamedParameters: true,
        useTypeOverInterfaces: true,
        enumGenerationType: 'union',
        fetch: {
          includeHttpResponseReturnType: true,
          forceSuccessResponse: true,
        },
      },
    },
  },

  amazingEkbHubZod: {
    input: {
      target: './openapi.json',
    },
    output: {
      target: './src/shared/api/generated-zod/index.ts',
      client: 'zod',
      mode: 'tags-split',
      fileExtension: '.zod.ts',
      clean: true,
      override: {
        zod: {
          strict: {
            response: true,
            body: true,
            query: true,
            param: true,
            header: true,
          },
          generate: {
            response: true,
            body: true,
            query: true,
            param: true,
            header: true,
          },
          generateEachHttpStatus: true,
        },
      },
    },
  },
});
