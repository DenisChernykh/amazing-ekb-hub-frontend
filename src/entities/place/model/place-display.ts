import type { MaterialType } from '@/shared/api/generated/model/materialType';
import type { PlaceCategory } from '@/shared/api/generated/model/placeCategory';
import type { Platform } from '@/shared/api/generated/model/platform';
import type { PlaceDisplayMeta, PlatformCounters } from './types';

const PLATFORM_DISPLAY: Record<Platform, PlaceDisplayMeta> = {
  dzen: { label: 'Дзен', color: '#111827', backgroundColor: '#e5e7eb' },
  telegram: { label: 'Telegram', color: '#075985', backgroundColor: '#dff3ff' },
  instagram: { label: 'Instagram', color: '#9d174d', backgroundColor: '#fce7f3' },
};

const DARK_BADGE_TEXT = '#111827';
const LIGHT_BADGE_TEXT = '#ffffff';
const HEX_COLOR_PATTERN = /^#[0-9a-f]{6}$/i;

const MATERIAL_TYPE_DISPLAY: Record<MaterialType, string> = {
  post: 'Пост',
  reel: 'Reels',
  video: 'Видео',
};

/**
 * Это хелпер. Возвращает подпись и цветовой тон категории.
 *
 * @param category - Категория места из API.
 * @returns Display-метаданные категории для UI.
 */
export function getPlaceCategoryDisplay(category: PlaceCategory): PlaceDisplayMeta {
  return {
    label: category.title,
    color: getReadableTextColor(category.badgeBackgroundColor),
    backgroundColor: category.badgeBackgroundColor,
  };
}

/**
 * Это хелпер. Подбирает читаемый цвет текста для HEX-фона категории.
 *
 * @param backgroundColor - HEX-цвет фона бейджа.
 * @returns Темный или светлый цвет текста.
 */
function getReadableTextColor(backgroundColor: string): string {
  if (!HEX_COLOR_PATTERN.test(backgroundColor)) {
    return DARK_BADGE_TEXT;
  }

  const red = Number.parseInt(backgroundColor.slice(1, 3), 16);
  const green = Number.parseInt(backgroundColor.slice(3, 5), 16);
  const blue = Number.parseInt(backgroundColor.slice(5, 7), 16);
  const luminance = getRelativeLuminance(red, green, blue);
  const darkContrast = getContrastRatio(luminance, getHexColorLuminance(DARK_BADGE_TEXT));
  const lightContrast = getContrastRatio(luminance, getHexColorLuminance(LIGHT_BADGE_TEXT));

  return darkContrast >= lightContrast ? DARK_BADGE_TEXT : LIGHT_BADGE_TEXT;
}

/**
 * Это хелпер. Считает относительную яркость HEX-цвета.
 *
 * @param color - HEX-цвет в формате `#RRGGBB`.
 * @returns WCAG-like luminance от 0 до 1.
 */
function getHexColorLuminance(color: string): number {
  const red = Number.parseInt(color.slice(1, 3), 16);
  const green = Number.parseInt(color.slice(3, 5), 16);
  const blue = Number.parseInt(color.slice(5, 7), 16);

  return getRelativeLuminance(red, green, blue);
}

/**
 * Это хелпер. Считает contrast ratio двух яркостей.
 *
 * @param firstLuminance - Первая относительная яркость.
 * @param secondLuminance - Вторая относительная яркость.
 * @returns Contrast ratio по WCAG-формуле.
 */
function getContrastRatio(firstLuminance: number, secondLuminance: number): number {
  const lighter = Math.max(firstLuminance, secondLuminance);
  const darker = Math.min(firstLuminance, secondLuminance);

  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Это хелпер. Считает относительную яркость RGB-цвета.
 *
 * @param red - Красный канал от 0 до 255.
 * @param green - Зеленый канал от 0 до 255.
 * @param blue - Синий канал от 0 до 255.
 * @returns WCAG-like luminance от 0 до 1.
 */
function getRelativeLuminance(red: number, green: number, blue: number): number {
  const [r, g, b] = [red, green, blue].map((channel) => {
    const normalized = channel / 255;

    return normalized <= 0.03928 ? normalized / 12.92 : ((normalized + 0.055) / 1.055) ** 2.4;
  });

  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/**
 * Это хелпер. Возвращает подпись и цветовой тон платформы.
 *
 * @param platform - Платформа материала.
 * @returns Display-метаданные платформы для UI.
 */
export function getPlatformDisplay(platform: Platform): PlaceDisplayMeta {
  return PLATFORM_DISPLAY[platform];
}

/**
 * Это хелпер. Возвращает человекочитаемую подпись типа материала.
 *
 * @param type - Тип материала из API.
 * @returns Подпись типа материала для UI.
 */
export function getMaterialTypeDisplay(type: MaterialType): string {
  return MATERIAL_TYPE_DISPLAY[type];
}

/**
 * Это хелпер. Оставляет только платформы с ненулевым количеством материалов.
 *
 * @param counters - Счетчики материалов по платформам.
 * @returns Список платформ и счетчиков, которые нужно показать в карточке.
 */
export function getVisiblePlatformCounters(counters: PlatformCounters) {
  return Object.entries(counters).flatMap(([platform, count]) =>
    count > 0 ? [{ platform: platform as Platform, count }] : [],
  );
}

const MATERIAL_DATE_FORMATTER = new Intl.DateTimeFormat('ru-RU', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
});

/**
 * Это хелпер. Форматирует дату публикации материала.
 *
 * @param publishedAt - ISO-дата публикации из API.
 * @returns Дата для отображения в карточке материала.
 */
export function formatMaterialPublishedDate(publishedAt: string): string {
  return MATERIAL_DATE_FORMATTER.format(new Date(publishedAt));
}

/**
 * Это хелпер. Форматирует длительность видеоформата.
 *
 * @param durationSec - Длительность в секундах или `null`.
 * @returns Короткая подпись длительности или `null`, если длительности нет.
 */
export function formatMaterialDuration(durationSec: number | null): string | null {
  if (durationSec === null) {
    return null;
  }

  const minutes = Math.floor(durationSec / 60);
  const seconds = durationSec % 60;

  if (minutes === 0) {
    return `${seconds} сек`;
  }

  return seconds === 0 ? `${minutes} мин` : `${minutes} мин ${seconds} сек`;
}

/**
 * Это хелпер. Склоняет подпись количества материалов.
 *
 * @param count - Количество материалов.
 * @returns Количество с корректной русской подписью.
 */
export function formatMaterialsCount(count: number): string {
  const normalizedCount = Math.abs(count);
  const lastTwoDigits = normalizedCount % 100;
  const lastDigit = normalizedCount % 10;

  if (lastTwoDigits >= 11 && lastTwoDigits <= 14) {
    return `${count} материалов`;
  }

  if (lastDigit === 1) {
    return `${count} материал`;
  }

  if (lastDigit >= 2 && lastDigit <= 4) {
    return `${count} материала`;
  }

  return `${count} материалов`;
}
