import type { PlaceCategory } from '@/shared/api/generated/model/placeCategory';
import { describe, expect, it } from 'vitest';
import { getPlaceCategoryDisplay } from './place-display';

/**
 * Создает тестовую категорию с заданным цветом фона бейджа.
 *
 * @param badgeBackgroundColor - HEX-цвет фона бейджа.
 * @returns Категория для проверки display helper.
 */
function makeCategory(badgeBackgroundColor: string): PlaceCategory {
  return {
    id: 'category_test',
    slug: 'test',
    title: 'Test',
    badgeBackgroundColor,
  };
}

describe('getPlaceCategoryDisplay', () => {
  it('uses dark text on light category backgrounds', () => {
    expect(getPlaceCategoryDisplay(makeCategory('#faf0ed')).color).toBe('#111827');
  });

  it('uses light text on dark category backgrounds', () => {
    expect(getPlaceCategoryDisplay(makeCategory('#111827')).color).toBe('#ffffff');
  });

  it('chooses the higher contrast text color for mid-tone category backgrounds', () => {
    expect(getPlaceCategoryDisplay(makeCategory('#808080')).color).toBe('#111827');
  });
});
