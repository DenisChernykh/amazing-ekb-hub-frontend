import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const UNCHANGED_PUBLIC_CARD_SOURCES = [
  'src/entities/category/ui/category-card.tsx',
  'src/entities/place/model/map-place-summary-to-card.ts',
  'src/entities/place/ui/place-card.tsx',
] as const;

describe('public place maps link source contract', () => {
  it('keeps mapsUrl and the maps action out of public list and category cards', () => {
    for (const path of UNCHANGED_PUBLIC_CARD_SOURCES) {
      const source = readFileSync(resolve(process.cwd(), path), 'utf8');

      expect(source, path).not.toContain('mapsUrl');
      expect(source, path).not.toContain('Открыть в картах');
    }
  });
});
