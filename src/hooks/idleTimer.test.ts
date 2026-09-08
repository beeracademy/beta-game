import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import useIdleTimer from "./idleTimer";

describe("useIdleTimer hook", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("calls onIdle after delayMs of inactivity", () => {
    const onIdle = vi.fn();
    renderHook(() => useIdleTimer(onIdle, 1000));

    expect(onIdle).not.toHaveBeenCalled();

    act(() => {
      vi.advanceTimersByTime(999);
    });
    expect(onIdle).not.toHaveBeenCalled();

    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(onIdle).toHaveBeenCalledTimes(1);
  });

  it("resets countdown when reset is called", () => {
    const onIdle = vi.fn();
    const { result } = renderHook(() => useIdleTimer(onIdle, 1000));

    act(() => {
      vi.advanceTimersByTime(800);
    });
    expect(onIdle).not.toHaveBeenCalled();

    // Activity reset
    act(() => {
      result.current();
    });

    act(() => {
      vi.advanceTimersByTime(800);
    });
    // Total 1600ms passed, but reset at 800ms, so only 800ms since reset
    expect(onIdle).not.toHaveBeenCalled();

    act(() => {
      vi.advanceTimersByTime(200);
    });
    expect(onIdle).toHaveBeenCalledTimes(1);
  });

  it("resets countdown on user activity events", () => {
    const onIdle = vi.fn();
    renderHook(() => useIdleTimer(onIdle, 1000));

    act(() => {
      vi.advanceTimersByTime(800);
    });
    expect(onIdle).not.toHaveBeenCalled();

    // User moves mouse
    act(() => {
      window.dispatchEvent(new MouseEvent("mousemove"));
    });

    act(() => {
      vi.advanceTimersByTime(800);
    });
    expect(onIdle).not.toHaveBeenCalled();

    act(() => {
      vi.advanceTimersByTime(200);
    });
    expect(onIdle).toHaveBeenCalledTimes(1);
  });

  it("cleans up event listeners and timer on unmount", () => {
    const onIdle = vi.fn();
    const { unmount } = renderHook(() => useIdleTimer(onIdle, 1000));

    unmount();

    act(() => {
      window.dispatchEvent(new KeyboardEvent("keydown"));
      vi.advanceTimersByTime(2000);
    });

    expect(onIdle).not.toHaveBeenCalled();
  });
});
