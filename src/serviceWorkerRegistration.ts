export type AudioFormat = "ogg" | "mp3";

/**
 * Checks if the current browser environment supports the OGG audio format.
 */
export function checkOggSupport(): boolean {
  if (typeof window === "undefined" || typeof Audio === "undefined") {
    return true;
  }
  try {
    const audio = new Audio();
    const canPlay = audio.canPlayType('audio/ogg; codecs="vorbis"');
    return canPlay === "probably" || canPlay === "maybe";
  } catch {
    return false;
  }
}

export interface ServiceWorkerRegistrationCallbacks {
  onPreloadProgress?: (data: {
    loaded: number;
    total: number;
    url?: string;
  }) => void;
  onPreloadComplete?: (data: { loaded: number; total: number }) => void;
}

let registrationPromise: Promise<ServiceWorkerRegistration | null> | null =
  null;

export function resetServiceWorkerRegistrationForTesting(): void {
  registrationPromise = null;
}

/**
 * Registers the background service worker in a non-blocking way.
 * Passes the preferred audio format (ogg vs mp3) based on browser codec support.
 */
export function registerServiceWorker(
  callbacks?: ServiceWorkerRegistrationCallbacks,
): Promise<ServiceWorkerRegistration | null> {
  if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
    return Promise.resolve(null);
  }

  navigator.serviceWorker.addEventListener("message", (event) => {
    if (!event.data) return;
    if (event.data.type === "PRELOAD_PROGRESS") {
      callbacks?.onPreloadProgress?.(event.data);
    } else if (event.data.type === "PRELOAD_COMPLETE") {
      if (event.data.downloaded === 0) {
        console.log(
          `[ServiceWorker] All ${event.data.total} game assets are already cached (0 new network downloads). Ready for offline play!`,
        );
      } else {
        console.log(
          `[ServiceWorker] Downloaded and cached ${event.data.downloaded} new assets (${event.data.cached ?? 0} were already cached). All ${event.data.total} assets ready for offline play!`,
        );
      }
      callbacks?.onPreloadComplete?.(event.data);
    }
  });

  if (registrationPromise) {
    return registrationPromise;
  }

  const audioFormat: AudioFormat = checkOggSupport() ? "ogg" : "mp3";
  const swUrl = `/sw.js?audio=${audioFormat}`;

  registrationPromise = new Promise((resolve) => {
    const doRegister = () => {
      // If a controller already exists, notify it immediately
      if (navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({
          type: "PRELOAD_ASSETS",
          audioFormat,
        });
      }

      navigator.serviceWorker
        .register(swUrl, { scope: "/" })
        .then((registration) => {
          const sw =
            registration.active ||
            registration.installing ||
            registration.waiting;
          if (sw) {
            sw.postMessage({
              type: "PRELOAD_ASSETS",
              audioFormat,
            });
          }
          resolve(registration);
        })
        .catch((err) => {
          console.warn(
            "[ServiceWorker] Registration failed. If running locally on HTTPS with a self-signed certificate, enable chrome://flags/#allow-insecure-localhost or use http://localhost:5173.\nError:",
            err,
          );
          resolve(null);
        });
    };

    doRegister();
  });

  return registrationPromise;
}
