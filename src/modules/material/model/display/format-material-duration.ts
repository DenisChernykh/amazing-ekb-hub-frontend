/**
 * Форматирует длительность материала в минутах.
 *
 * @param durationSec - Длительность в секундах или `null`.
 * @returns Человекочитаемую длительность или `undefined`.
 */
export function formatMaterialDuration(durationSec: number | null): string | undefined {
  if (durationSec === null) {
    return undefined;
  }

  const minutes = Math.max(1, Math.ceil(durationSec / 60));

  return `${minutes} мин`;
}
