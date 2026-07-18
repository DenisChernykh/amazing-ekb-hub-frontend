import { describe, expect, it } from 'vitest';
import { formatMaterialPublishedDate } from './place-display';

describe('formatMaterialPublishedDate', () => {
  it('formats date-only values as calendar dates without timezone shift', () => {
    expect(formatMaterialPublishedDate('2026-03-20')).toBe('20 марта 2026 г.');
  });
});
