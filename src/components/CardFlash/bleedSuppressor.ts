let bleedSuppressionTimeout: ReturnType<typeof setTimeout> | null = null;
let activeCleanup: (() => void) | null = null;

export const resetBleedSuppression = () => {
  if (activeCleanup) {
    activeCleanup();
  }
  if (bleedSuppressionTimeout) {
    clearTimeout(bleedSuppressionTimeout);
    bleedSuppressionTimeout = null;
  }
};

/**
 * Suppresses synthetic mouse, pointer, and click events from bleeding through
 * to underlying elements after a touch gesture on an overlay or modal.
 */
export const suppressBleedThrough = (durationMs = 400) => {
  if (typeof window === "undefined") return;

  resetBleedSuppression();

  const stopEvent = (e: Event) => {
    e.stopPropagation();
    e.stopImmediatePropagation();
    if (e.cancelable) {
      e.preventDefault();
    }
  };

  const eventTypes = [
    "click",
    "pointerdown",
    "pointerup",
    "touchend",
  ] as const;

  eventTypes.forEach((type) => {
    window.addEventListener(type, stopEvent, { capture: true, passive: false });
  });

  const cleanup = () => {
    eventTypes.forEach((type) => {
      window.removeEventListener(type, stopEvent, { capture: true });
    });
    activeCleanup = null;
    bleedSuppressionTimeout = null;
  };

  activeCleanup = cleanup;
  bleedSuppressionTimeout = setTimeout(cleanup, durationMs);
};
