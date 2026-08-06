import { describe, expect, it } from 'vitest';
import { parseCollectionPage } from './parse-collection-page';

describe('parseCollectionPage', () => {
  it.each([
    [{}, 1],
    [{ page: '1' }, 1],
    [{ page: '2' }, 2],
    [{ page: ['3', '4'] }, 3],
    [{ page: '0004' }, 4],
  ])('normalizes a valid page input %#', (searchParams, expected) => {
    expect(parseCollectionPage(searchParams)).toBe(expected);
  });

  it.each([
    { page: '' },
    { page: '0' },
    { page: '-1' },
    { page: '1.5' },
    { page: '1e2' },
    { page: ' page 2 ' },
    { page: [] },
  ])('falls back to page one for invalid input %#', (searchParams) => {
    expect(parseCollectionPage(searchParams)).toBe(1);
  });
});
