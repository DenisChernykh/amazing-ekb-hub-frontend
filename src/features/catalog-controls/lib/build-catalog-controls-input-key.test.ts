import { describe, expect, it } from 'vitest';
import { buildCatalogControlsInputKey } from './build-catalog-controls-input-key';

describe('buildCatalogControlsInputKey', () => {
  it('changes when the applied category changes without changing search', () => {
    expect(
      buildCatalogControlsInputKey({
        search: 'Хаятт',
        category: 'hotels',
      }),
    ).not.toBe(
      buildCatalogControlsInputKey({
        search: 'Хаятт',
        category: 'cafe',
      }),
    );
  });

  it('keeps a stable empty state key for no applied filters', () => {
    expect(buildCatalogControlsInputKey({})).toBe('search=|category=all');
  });
});
