import { useCallback, useEffect, useRef } from "react";

const ACTIVITY_EVENTS = [
  "mousemove",
  "mousedown",
  "keydown",
  "touchstart",
  "scroll",
  "wheel",
] as const;

/**
 * Calls `onIdle` once after `delayMs` of inactivity.
 * Automatically resets the timer when user activity (mouse, keyboard, touch, scroll) is detected.
 * Returns a `reset` function — call it whenever there is explicit activity to restart
 * the countdown. The timer is also started automatically on mount.
 * Cleans up on unmount.
 */
const useIdleTimer = (onIdle: () => void, delayMs: number) => {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastActivityRef = useRef<number>(0);

  // Keep the callback ref up-to-date so we never capture a stale closure,
  // without needing to re-schedule the timer when the callback changes.
  const onIdleRef = useRef(onIdle);
  useEffect(() => {
    onIdleRef.current = onIdle;
  }, [onIdle]);

  const reset = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    timerRef.current = setTimeout(() => {
      onIdleRef.current();
    }, delayMs);
  }, [delayMs]);

  // Start the timer on mount, listen for user activity events, and clean up on unmount.
  useEffect(() => {
    reset();

    const throttleMs = Math.min(500, Math.max(50, Math.floor(delayMs / 2)));
    const handleActivity = () => {
      const now = Date.now();
      if (now - lastActivityRef.current >= throttleMs) {
        lastActivityRef.current = now;
        reset();
      }
    };

    for (const event of ACTIVITY_EVENTS) {
      window.addEventListener(event, handleActivity, { passive: true });
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      for (const event of ACTIVITY_EVENTS) {
        window.removeEventListener(event, handleActivity);
      }
    };
  }, [reset, delayMs]);

  return reset;
};

export default useIdleTimer;
