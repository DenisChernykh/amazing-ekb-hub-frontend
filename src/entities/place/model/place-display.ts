import type { MaterialType } from '@/shared/api/generated/model/materialType';
import type { Platform } from '@/shared/api/generated/model/platform';
import type { PlaceDisplayMeta, PlatformCounters } from './types';

const PLATFORM_DISPLAY: Record<Platform, PlaceDisplayMeta> = {
  dzen: { label: 'Дзен', color: '#111827', backgroundColor: '#e5e7eb' },
  telegram: { label: 'Telegram', color: '#075985', backgroundColor: '#dff3ff' },
  instagram: { label: 'Instagram', color: '#9d174d', backgroundColor: '#fce7f3' },
};

const MATERIAL_TYPE_DISPLAY: Record<MaterialType, string> = {
  post: 'Пост',
  reel: 'Reels',
  video: 'Видео',
};

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
 * @param publishedAt - Календарная дата публикации из API в формате `YYYY-MM-DD`.
 * @returns Дата для отображения в карточке материала.
 */
export function formatMaterialPublishedDate(publishedAt: string): string {
  const calendarDateMatch = /^(\d{4})-(\d{2})-(\d{2})$/.exec(publishedAt);

  if (calendarDateMatch) {
    const [, year, month, day] = calendarDateMatch.map(Number);

    return MATERIAL_DATE_FORMATTER.format(new Date(year, month - 1, day));
  }

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
