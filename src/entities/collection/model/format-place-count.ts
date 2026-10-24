/**
 * Форматирует количество мест с русским склонением.
 *
 * @param count - Неотрицательное количество мест.
 * @returns Количество и подходящая форма слова «место».
 */
export function formatPlaceCount(count: number): string {
  const lastTwoDigits = count % 100;
  const lastDigit = count % 10;
  const word =
    lastTwoDigits >= 11 && lastTwoDigits <= 14
      ? 'мест'
      : lastDigit === 1
        ? 'место'
        : lastDigit >= 2 && lastDigit <= 4
          ? 'места'
          : 'мест';

  return `${count} ${word}`;
}
