import { useEffect, useRef } from "react";

export const DEFAULT_INACTIVITY_DELAY_MS = 1000 * 60 * 15; // 15 minutes

export interface UseCardInactivityTimerOptions {
  onInactive: () => void;
  turnStartTimestamp: number;
  isChugActive: boolean;
  isDone: boolean;
  delayMs?: number;
}

/**
 * Monitors card drawing activity during an open game.
 * Plays the inactivity sound when no card has been drawn for `delayMs` (default: 15 min).
 * Repeats every `delayMs` if no card is drawn.
 * When an Ace is drawn (chug), the timer continues until the chug is actively started.
 * While a chug is actively in progress, the timer pauses and does not play sound.
 * Once the chug finishes, the 15-minute countdown starts from when the chug completed.
 * Drawing a card resets the countdown back to `delayMs`.
 */
export const useCardInactivityTimer = ({
  onInactive,
  turnStartTimestamp,
  isChugActive,
  isDone,
  delayMs = DEFAULT_INACTIVITY_DELAY_MS,
}: UseCardInactivityTimerOptions) => {
  const onInactiveRef = useRef(onInactive);
  useEffect(() => {
    onInactiveRef.current = onInactive;
  }, [onInactive]);

  const lastSoundPlayedAtRef = useRef<number>(0);
  const prevTurnStartRef = useRef<number>(turnStartTimestamp);

  useEffect(() => {
    // If a new turn has started, reset the last played marker
    if (turnStartTimestamp !== prevTurnStartRef.current) {
      prevTurnStartRef.current = turnStartTimestamp;
      lastSoundPlayedAtRef.current = 0;
    }

    if (!turnStartTimestamp || isChugActive || isDone) {
      return;
    }

    let timer: ReturnType<typeof setTimeout> | null = null;

    const scheduleNext = () => {
      const baseTime = Math.max(
        turnStartTimestamp,
        lastSoundPlayedAtRef.current,
      );
      const remainingMs = Math.max(0, baseTime + delayMs - Date.now());

      timer = setTimeout(() => {
        lastSoundPlayedAtRef.current = Date.now();
        onInactiveRef.current();
        scheduleNext();
      }, remainingMs);
    };

    scheduleNext();

    return () => {
      if (timer) {
        clearTimeout(timer);
      }
    };
  }, [turnStartTimestamp, isChugActive, isDone, delayMs]);
};
