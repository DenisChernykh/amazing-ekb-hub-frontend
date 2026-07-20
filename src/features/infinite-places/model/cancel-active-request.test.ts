import { describe, expect, it, vi } from 'vitest';
import { cancelActiveRequest } from './cancel-active-request';

describe('cancelActiveRequest', () => {
  it('clears the active ref before abort and reports one cancellation', () => {
    const controller = new AbortController();
    const requestRef = { current: controller };
    const onCancel = vi.fn();
    let requestDuringAbort: AbortController | null = controller;

    controller.signal.addEventListener('abort', () => {
      requestDuringAbort = requestRef.current;
    });

    cancelActiveRequest(requestRef, onCancel);
    cancelActiveRequest(requestRef, onCancel);

    expect(requestRef.current).toBeNull();
    expect(requestDuringAbort).toBeNull();
    expect(controller.signal.aborted).toBe(true);
    expect(onCancel).toHaveBeenCalledOnce();
  });

  it('does nothing when there is no active request', () => {
    const onCancel = vi.fn();

    cancelActiveRequest({ current: null }, onCancel);

    expect(onCancel).not.toHaveBeenCalled();
  });
});
