import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  checkOggSupport,
  registerServiceWorker,
  resetServiceWorkerRegistrationForTesting,
} from "./serviceWorkerRegistration";

describe("serviceWorkerRegistration", () => {
  beforeEach(() => {
    resetServiceWorkerRegistrationForTesting();
  });

  afterEach(() => {
    resetServiceWorkerRegistrationForTesting();
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  describe("checkOggSupport", () => {
    it("returns true when canPlayType returns probably or maybe", () => {
      vi.stubGlobal(
        "Audio",
        class {
          canPlayType(type: string) {
            if (type.includes("ogg")) return "probably";
            return "";
          }
        },
      );

      expect(checkOggSupport()).toBe(true);
    });

    it("returns false when canPlayType returns empty string", () => {
      vi.stubGlobal(
        "Audio",
        class {
          canPlayType(type: string) {
            if (type.includes("ogg")) return "";
            return "probably";
          }
        },
      );

      expect(checkOggSupport()).toBe(false);
    });

    it("returns false when Audio constructor throws", () => {
      vi.stubGlobal(
        "Audio",
        class {
          constructor() {
            throw new Error("Audio not supported");
          }
        },
      );

      expect(checkOggSupport()).toBe(false);
    });
  });

  describe("registerServiceWorker", () => {
    it("resolves null when serviceWorker is not supported in navigator", async () => {
      vi.stubGlobal("navigator", {});

      const res = await registerServiceWorker();
      expect(res).toBeNull();
    });

    it("registers service worker with ogg query param when ogg is supported", async () => {
      vi.stubGlobal(
        "Audio",
        class {
          canPlayType() {
            return "probably";
          }
        },
      );

      const postMessageMock = vi.fn();
      const mockRegistration = {
        active: { postMessage: postMessageMock },
        installing: null,
        waiting: null,
      };

      const registerMock = vi.fn().mockResolvedValue(mockRegistration);
      const addEventListenerMock = vi.fn();

      vi.stubGlobal("navigator", {
        serviceWorker: {
          register: registerMock,
          addEventListener: addEventListenerMock,
        },
      });

      // Force document.readyState to complete
      Object.defineProperty(document, "readyState", {
        value: "complete",
        writable: true,
        configurable: true,
      });

      const res = await registerServiceWorker();
      expect(res).toBe(mockRegistration);
      expect(registerMock).toHaveBeenCalledWith("/sw.js?audio=ogg", {
        scope: "/",
      });
      expect(postMessageMock).toHaveBeenCalledWith({
        type: "PRELOAD_ASSETS",
        audioFormat: "ogg",
      });
    });

    it("invokes callbacks on service worker messages", async () => {
      let messageHandler: ((event: any) => void) | null = null;
      const addEventListenerMock = vi.fn((event, handler) => {
        if (event === "message") {
          messageHandler = handler;
        }
      });

      const mockRegistration = {
        active: null,
        installing: null,
        waiting: null,
      };

      vi.stubGlobal("navigator", {
        serviceWorker: {
          register: vi.fn().mockResolvedValue(mockRegistration),
          addEventListener: addEventListenerMock,
        },
      });

      const onProgress = vi.fn();
      const onComplete = vi.fn();

      registerServiceWorker({
        onPreloadProgress: onProgress,
        onPreloadComplete: onComplete,
      });

      expect(messageHandler).not.toBeNull();
      if (messageHandler) {
        (messageHandler as any)({
          data: { type: "PRELOAD_PROGRESS", loaded: 10, total: 100 },
        });
        expect(onProgress).toHaveBeenCalledWith({
          type: "PRELOAD_PROGRESS",
          loaded: 10,
          total: 100,
        });

        (messageHandler as any)({
          data: { type: "PRELOAD_COMPLETE", loaded: 100, total: 100 },
        });
        expect(onComplete).toHaveBeenCalledWith({
          type: "PRELOAD_COMPLETE",
          loaded: 100,
          total: 100,
        });
      }
    });
  });
});
