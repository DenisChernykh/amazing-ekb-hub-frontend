#!/usr/bin/env node

import { once } from 'node:events';
import { createServer } from 'node:http';
import { pathToFileURL } from 'node:url';

const HOST = '127.0.0.1';
const DEFAULT_PORT = 3000;

const category = {
  id: 'ci-category-spa',
  slug: 'ci-spa',
  title: 'CI SPA',
  coverImageUrl: null,
};

const placeSummary = {
  id: 'ci-place-spa',
  slug: 'ci-spa-place',
  title: 'CI SPA Place',
  summary: 'Deterministic frontend CI fixture',
  tags: ['ci', 'fixture'],
  category,
  counters: {
    dzen: 0,
    telegram: 0,
    instagram: 0,
  },
  status: 'active',
  coverImageUrl: null,
};

const placeDetail = {
  ...placeSummary,
  mapsUrl: null,
  pinnedMaterial: null,
};

const collection = {
  id: 'ci-collection',
  slug: 'ci-collection',
  title: 'CI Collection',
  description: null,
  coverImageUrl: null,
  placeCount: 1,
};

function sendJson(response, statusCode, body) {
  response.writeHead(statusCode, {
    'content-type': 'application/json; charset=utf-8',
  });
  response.end(JSON.stringify(body));
}

/** Создаёт локальный HTTP fixture только для детерминированного frontend CI build. */
export function createCatalogBuildFixtureServer() {
  return createServer((request, response) => {
    if (request.method !== 'GET' || !request.url) {
      sendJson(response, 405, { status: 405, title: 'Method Not Allowed' });
      return;
    }

    const url = new URL(request.url, 'http://fixture.local');

    if (url.pathname === '/__ci/ready') {
      sendJson(response, 200, { status: 'ok' });
      return;
    }

    if (url.pathname === '/v1/categories') {
      sendJson(response, 200, { items: [category] });
      return;
    }

    if (url.pathname === `/v1/categories/${category.slug}`) {
      sendJson(response, 200, category);
      return;
    }

    if (url.pathname === '/v1/collections') {
      sendJson(response, 200, { items: [collection] });
      return;
    }

    if (url.pathname === `/v1/collections/${collection.slug}`) {
      const page = Number(url.searchParams.get('page') ?? 1);
      const pageSize = Number(url.searchParams.get('pageSize') ?? 20);
      const { placeCount: _placeCount, ...collectionDetail } = collection;
      sendJson(response, 200, {
        ...collectionDetail,
        items: [placeSummary],
        page,
        pageSize,
        total: 1,
      });
      return;
    }

    if (url.pathname === '/v1/places') {
      const pageSize = Number(url.searchParams.get('pageSize') ?? 20);
      sendJson(response, 200, {
        items: [placeSummary],
        page: 1,
        pageSize,
        total: 1,
      });
      return;
    }

    if (url.pathname === `/v1/places/${placeSummary.slug}`) {
      sendJson(response, 200, placeDetail);
      return;
    }

    if (url.pathname === `/v1/places/${placeSummary.slug}/materials`) {
      sendJson(response, 200, { items: [] });
      return;
    }

    sendJson(response, 404, { status: 404, title: 'Not Found' });
  });
}

function readPort() {
  const port = Number(process.env.CATALOG_BUILD_FIXTURE_PORT ?? DEFAULT_PORT);

  if (!Number.isInteger(port) || port < 1 || port > 65_535) {
    throw new Error('CATALOG_BUILD_FIXTURE_PORT must be an integer between 1 and 65535');
  }

  return port;
}

async function startCatalogBuildFixtureServer() {
  const server = createCatalogBuildFixtureServer();
  server.listen(readPort(), HOST);
  await once(server, 'listening');

  const address = server.address();
  if (!address || typeof address === 'string') throw new Error('Fixture server has no TCP port');

  console.log(`Catalog build fixture ready at http://${HOST}:${address.port}`);

  const shutdown = () => server.close();
  process.once('SIGINT', shutdown);
  process.once('SIGTERM', shutdown);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  await startCatalogBuildFixtureServer();
}
