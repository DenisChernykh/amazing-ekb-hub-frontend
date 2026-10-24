type MaterialRowTarget = {
  getAttribute(name: string): string | null;
};

type ClosestCapableTarget = {
  closest(selector: string): MaterialRowTarget | null;
};

/**
 * Это хелпер. Находит id ближайшей строки материала без зависимости от DOM-классов.
 *
 * @param target - Исходная цель pointer/focus события.
 * @returns Id preview или `null`, если событие пришло не из строки.
 */
export function getPreviewIdFromTarget(target: EventTarget | null): string | null {
  if (!target || typeof (target as Partial<ClosestCapableTarget>).closest !== 'function') {
    return null;
  }

  const row = (target as unknown as ClosestCapableTarget).closest('[data-material-id]');
  const materialId = row?.getAttribute('data-material-id')?.trim();

  return materialId || null;
}
