import { useCallback, useEffect, useRef } from "react";

/**
 * Calls `onIdle` once after `delayMs` of inactivity.
 * Returns a `reset` function — call it whenever there is activity to restart
 * the countdown. The timer is also started automatically on mount.
 * Cleans up on unmount.
 */
const useIdleTimer = (onIdle: () => void, delayMs: number) => {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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

  // Start the timer on mount and clean up on unmount.
  useEffect(() => {
    reset();
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [reset]);

  return reset;
};

export default useIdleTimer;
