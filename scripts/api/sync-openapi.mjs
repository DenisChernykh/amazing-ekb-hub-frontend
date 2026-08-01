#!/usr/bin/env node

import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const DEFAULT_SPEC_SOURCE = 'http://127.0.0.1:3000/openapi.json';
const DEFAULT_SPEC_OUTPUT = 'openapi.json';

const source = process.env.OPENAPI_SPEC_SOURCE ?? DEFAULT_SPEC_SOURCE;
const output = process.env.OPENAPI_SPEC_OUTPUT ?? DEFAULT_SPEC_OUTPUT;
const outputPath = resolve(process.cwd(), output);

const isHttpSource = source.startsWith('http://') || source.startsWith('https://');

function isRecord(value) {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function validateOpenApiDocument(openApiSpec) {
  let document;

  try {
    document = JSON.parse(openApiSpec);
  } catch {
    throw new Error('OpenAPI source is not valid JSON');
  }

  if (
    !isRecord(document) ||
    typeof document.openapi !== 'string' ||
    !isRecord(document.info) ||
    !isRecord(document.paths)
  ) {
    throw new Error('OpenAPI source must contain openapi, info and paths');
  }
}

async function readOpenApiSource() {
  if (isHttpSource) {
    const response = await fetch(source);

    if (!response.ok) {
      throw new Error(`OpenAPI request failed: ${response.status} ${response.statusText}`);
    }

    return response.text();
  }

  const filePath = source.startsWith('file:')
    ? fileURLToPath(source)
    : resolve(process.cwd(), source);

  return readFile(filePath, 'utf8');
}

const openApiSpec = await readOpenApiSource();

if (!openApiSpec.trim()) {
  throw new Error('OpenAPI source is empty');
}

validateOpenApiDocument(openApiSpec);

await mkdir(dirname(outputPath), { recursive: true });
await writeFile(outputPath, openApiSpec);

console.log(`Synced OpenAPI spec: ${source} -> ${output}`);
