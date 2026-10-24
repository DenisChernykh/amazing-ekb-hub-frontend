import { once } from 'node:events';
import type { Server } from 'node:http';
import { afterEach, describe, expect, it } from 'vitest';
import { createCatalogBuildFixtureServer } from '../scripts/ci/catalog-build-fixture-server.mjs';
import {
  CategoriesGet200Response,
  CategoriesList200Response,
} from './shared/api/generated-zod/categories/categories.zod';
import {
  CollectionsGet200Response,
  CollectionsList200Response,
} from './shared/api/generated-zod/collections/collections.zod';
import {
  PlaceMaterialsList200Response,
  PlacesGet200Response,
  PlacesList200Response,
} from './shared/api/generated-zod/places/places.zod';

let server: Server | undefined;

afterEach(async () => {
  if (!server) return;

  server.closeAllConnections();
  server.close();
  await once(server, 'close');
  server = undefined;
});

describe('catalog build fixture server', () => {
  it('serves valid deterministic catalog payloads required by next build', async () => {
    server = createCatalogBuildFixtureServer();
    server.listen(0, '127.0.0.1');
    await once(server, 'listening');

    const address = server.address();
    if (!address || typeof address === 'string') throw new Error('Fixture server has no TCP port');

    const origin = `http://127.0.0.1:${address.port}`;
    const [categories, category, collections, collection, places, place, materials] =
      await Promise.all([
        fetch(`${origin}/v1/categories`).then((response) => response.json()),
        fetch(`${origin}/v1/categories/ci-spa`).then((response) => response.json()),
        fetch(`${origin}/v1/collections`).then((response) => response.json()),
        fetch(`${origin}/v1/collections/ci-collection?page=1&pageSize=20`).then((response) =>
          response.json(),
        ),
        fetch(`${origin}/v1/places?page=1&pageSize=100`).then((response) => response.json()),
        fetch(`${origin}/v1/places/ci-spa-place`).then((response) => response.json()),
        fetch(`${origin}/v1/places/ci-spa-place/materials?platform=telegram`).then((response) =>
          response.json(),
        ),
      ]);

    expect(CategoriesList200Response.parse(categories).items).toHaveLength(1);
    expect(CategoriesGet200Response.parse(category).slug).toBe('ci-spa');
    expect(CollectionsList200Response.parse(collections).items[0]).toMatchObject({
      slug: 'ci-collection',
      coverImageUrl: null,
    });
    expect(CollectionsGet200Response.parse(collection)).toMatchObject({
      slug: 'ci-collection',
      coverImageUrl: null,
      items: [{ slug: 'ci-spa-place', status: 'active' }],
      page: 1,
      pageSize: 20,
      total: 1,
    });
    expect(PlacesList200Response.parse(places)).toMatchObject({ page: 1, pageSize: 100, total: 1 });
    expect(PlacesGet200Response.parse(place).slug).toBe('ci-spa-place');
    expect(PlaceMaterialsList200Response.parse(materials)).toEqual({ items: [] });
  });
});
