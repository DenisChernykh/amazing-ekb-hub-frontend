/**
 * Форматирует длительность материала в минутах.
 */
export function formatMaterialDuration(durationSec: number | null): string | undefined {
  if (durationSec === null) {
    return undefined;
  }

  const minutes = Math.max(1, Math.ceil(durationSec / 60));

  return `${minutes} мин`;
}
