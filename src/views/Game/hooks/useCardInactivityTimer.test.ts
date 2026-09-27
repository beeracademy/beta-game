import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useCardInactivityTimer } from "./useCardInactivityTimer";

describe("useCardInactivityTimer", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("calls onInactive after delayMs of inactivity", () => {
    const onInactive = vi.fn();
    const now = Date.now();

    renderHook(() =>
      useCardInactivityTimer({
        onInactive,
        turnStartTimestamp: now,
        isChugActive: false,
        isDone: false,
        delayMs: 1000,
      }),
    );

    expect(onInactive).not.toHaveBeenCalled();

    act(() => {
      vi.advanceTimersByTime(999);
    });
    expect(onInactive).not.toHaveBeenCalled();

    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(onInactive).toHaveBeenCalledTimes(1);
  });

  it("repeats every delayMs if still inactive", () => {
    const onInactive = vi.fn();
    const now = Date.now();

    renderHook(() =>
      useCardInactivityTimer({
        onInactive,
        turnStartTimestamp: now,
        isChugActive: false,
        isDone: false,
        delayMs: 1000,
      }),
    );

    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(onInactive).toHaveBeenCalledTimes(1);

    act(() => {
      vi.advanceTimersByTime(999);
    });
    expect(onInactive).toHaveBeenCalledTimes(1);

    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(onInactive).toHaveBeenCalledTimes(2);

    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(onInactive).toHaveBeenCalledTimes(3);
  });

  it("resets countdown when turnStartTimestamp changes (e.g. card drawn)", () => {
    const onInactive = vi.fn();
    let turnStart = Date.now();

    const { rerender } = renderHook(
      ({ turnStartTimestamp }) =>
        useCardInactivityTimer({
          onInactive,
          turnStartTimestamp,
          isChugActive: false,
          isDone: false,
          delayMs: 1000,
        }),
      {
        initialProps: { turnStartTimestamp: turnStart },
      },
    );

    act(() => {
      vi.advanceTimersByTime(800);
    });
    expect(onInactive).not.toHaveBeenCalled();

    // Card drawn at 800ms
    turnStart = Date.now();
    rerender({ turnStartTimestamp: turnStart });

    act(() => {
      vi.advanceTimersByTime(800);
    });
    // 800ms since card draw -> should not have fired yet
    expect(onInactive).not.toHaveBeenCalled();

    act(() => {
      vi.advanceTimersByTime(200);
    });
    // 1000ms since card draw -> fires
    expect(onInactive).toHaveBeenCalledTimes(1);
  });

  it("does not run while isChugActive is true, starts countdown when chug finishes", () => {
    const onInactive = vi.fn();
    let turnStart = Date.now();

    // Ace drawn -> chug starts (active)
    const { rerender } = renderHook(
      ({ isChugActive, turnStartTimestamp }) =>
        useCardInactivityTimer({
          onInactive,
          turnStartTimestamp,
          isChugActive,
          isDone: false,
          delayMs: 1000,
        }),
      {
        initialProps: { isChugActive: true, turnStartTimestamp: turnStart },
      },
    );

    // 2 seconds pass during chug -> no sound
    act(() => {
      vi.advanceTimersByTime(2000);
    });
    expect(onInactive).not.toHaveBeenCalled();

    // Chug completes -> turnStartTimestamp is set to completion time, isChugActive becomes false
    turnStart = Date.now();
    rerender({ isChugActive: false, turnStartTimestamp: turnStart });

    act(() => {
      vi.advanceTimersByTime(999);
    });
    expect(onInactive).not.toHaveBeenCalled();

    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(onInactive).toHaveBeenCalledTimes(1);
  });

  it("does not run when isDone is true", () => {
    const onInactive = vi.fn();
    const now = Date.now();

    renderHook(() =>
      useCardInactivityTimer({
        onInactive,
        turnStartTimestamp: now,
        isChugActive: false,
        isDone: true,
        delayMs: 1000,
      }),
    );

    act(() => {
      vi.advanceTimersByTime(5000);
    });
    expect(onInactive).not.toHaveBeenCalled();
  });

  it("cleans up timers on unmount", () => {
    const onInactive = vi.fn();
    const now = Date.now();

    const { unmount } = renderHook(() =>
      useCardInactivityTimer({
        onInactive,
        turnStartTimestamp: now,
        isChugActive: false,
        isDone: false,
        delayMs: 1000,
      }),
    );

    unmount();

    act(() => {
      vi.advanceTimersByTime(2000);
    });
    expect(onInactive).not.toHaveBeenCalled();
  });
});
