import { useEffect, useLayoutEffect, useRef } from "react";

/**
 * Invokes the callback once per animation frame while `active` is true.
 *
 * Prefer this over short `setInterval` timers for anything that only updates a
 * visual value: it caps updates at the display refresh rate and the browser
 * automatically pauses it while the tab is hidden.
 */
export const useAnimationFrame = (active: boolean, callback: () => void) => {
  const callbackRef = useRef(callback);

  useLayoutEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    if (!active) {
      return;
    }

    let frame = requestAnimationFrame(function tick() {
      callbackRef.current();
      frame = requestAnimationFrame(tick);
    });

    return () => cancelAnimationFrame(frame);
  }, [active]);
};
