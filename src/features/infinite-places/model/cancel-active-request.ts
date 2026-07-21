/** Mutable holder for the current append request controller. */
export type ActiveRequestRef = {
  current: AbortController | null;
};

/** Clears and aborts the active append request, then reports its cancellation. */
export function cancelActiveRequest(requestRef: ActiveRequestRef, onCancel: () => void): void {
  const controller = requestRef.current;
  if (!controller) return;

  requestRef.current = null;
  controller.abort();
  onCancel();
}
