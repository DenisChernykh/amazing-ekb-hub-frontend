import type { ActiveRequestRef } from './cancel-active-request';

/** Runs a settlement only while its controller still owns the active request ref. */
export function runIfActiveRequest(
  requestRef: ActiveRequestRef,
  controller: AbortController,
  settle: () => void,
): void {
  if (requestRef.current !== controller) return;
  settle();
}
