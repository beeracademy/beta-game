import { beforeEach, describe, expect, it, vi } from "vitest";
import swContent from "../public/sw.js?raw";

const ORIGIN = "http://localhost:5173";

class FakeCache {
  store = new Map<string, Response>();

  private key(request: RequestInfo | URL): string {
    const raw =
      typeof request === "string"
        ? request
        : request instanceof URL
          ? request.href
          : (request as Request).url;
    return new URL(raw, ORIGIN).pathname;
  }

  async match(request: RequestInfo | URL): Promise<Response | undefined> {
    return this.store.get(this.key(request));
  }

  async put(request: RequestInfo | URL, response: Response): Promise<void> {
    this.store.set(this.key(request), response);
  }
}

interface SwHarness {
  dispatchFetch: (request: Request) => Promise<Response | "not-handled">;
  cache: FakeCache;
  fetchMock: ReturnType<typeof vi.fn>;
}

function loadServiceWorker(): SwHarness {
  const listeners = new Map<string, (event: any) => void>();
  const cache = new FakeCache();
  const fetchMock = vi.fn();

  const self: any = {
    location: { href: `${ORIGIN}/sw.js?audio=ogg`, origin: ORIGIN },
    addEventListener: (type: string, handler: (event: any) => void) => {
      listeners.set(type, handler);
    },
    skipWaiting: () => {},
    clients: { claim: async () => {}, matchAll: async () => [] },
    registration: {},
  };

  const caches: any = {
    open: async () => cache,
    match: async (request: RequestInfo | URL) => cache.match(request),
    keys: async () => [],
    delete: async () => true,
  };

  // eslint-disable-next-line no-new-func
  const factory = new Function("self", "caches", "fetch", "console", swContent);
  factory(self, caches, fetchMock, { log: () => {}, warn: () => {} });

  const dispatchFetch = async (request: Request) => {
    const handler = listeners.get("fetch");
    if (!handler) throw new Error("no fetch listener registered");

    let responded: Promise<Response> | null = null;
    handler({
      request,
      respondWith: (promise: Promise<Response>) => {
        responded = promise;
      },
      waitUntil: () => {},
    });

    if (!responded) return "not-handled" as const;
    return await responded;
  };

  return { dispatchFetch, cache, fetchMock };
}

function makeRequest(
  path: string,
  init?: { mode?: string; destination?: string; method?: string },
): Request {
  const request = new Request(new URL(path, ORIGIN).href, {
    method: init?.method ?? "GET",
  });
  Object.defineProperty(request, "mode", { value: init?.mode ?? "cors" });
  Object.defineProperty(request, "destination", {
    value: init?.destination ?? "",
  });
  return request;
}

describe("Service worker fetch handling", () => {
  let sw: SwHarness;

  beforeEach(() => {
    sw = loadServiceWorker();
  });

  it("does not intercept app routes that are not cacheable assets", async () => {
    const result = await sw.dispatchFetch(
      makeRequest("/remote?token=abc-123", { mode: "cors" }),
    );

    expect(result).toBe("not-handled");
    expect(sw.fetchMock).not.toHaveBeenCalled();
  });

  it("treats document requests as navigations even when mode is not 'navigate'", async () => {
    sw.fetchMock.mockResolvedValue(
      new Response("<html></html>", { status: 200 }),
    );

    const response = await sw.dispatchFetch(
      makeRequest("/remote?token=abc-123", {
        mode: "cors",
        destination: "document",
      }),
    );

    expect(response).not.toBe("not-handled");
    expect((response as Response).status).toBe(200);
    expect(sw.fetchMock).toHaveBeenCalledTimes(1);
  });

  it("falls back to the cached shell when a navigation cannot reach the network", async () => {
    await sw.cache.put("/index.html", new Response("cached shell"));
    sw.fetchMock.mockRejectedValue(new TypeError("Failed to fetch"));

    const response = await sw.dispatchFetch(
      makeRequest("/remote?token=abc-123", { mode: "navigate" }),
    );

    expect(response).not.toBe("not-handled");
    expect(await (response as Response).text()).toBe("cached shell");
  });

  it("never rejects respondWith when a cacheable asset fails to load", async () => {
    sw.fetchMock.mockRejectedValue(new TypeError("Failed to fetch"));

    const response = await sw.dispatchFetch(makeRequest("/cards/S-14.png"));

    expect(response).not.toBe("not-handled");
    expect((response as Response).status).toBe(504);
  });

  it("serves cacheable assets from the cache without hitting the network", async () => {
    await sw.cache.put("/cards/S-14.png", new Response("card-bytes"));

    const response = await sw.dispatchFetch(makeRequest("/cards/S-14.png"));

    expect(await (response as Response).text()).toBe("card-bytes");
    expect(sw.fetchMock).not.toHaveBeenCalled();
  });

  it("ignores API and websocket paths", async () => {
    expect(await sw.dispatchFetch(makeRequest("/api/games/1"))).toBe(
      "not-handled",
    );
    expect(await sw.dispatchFetch(makeRequest("/ws/remote/abc/"))).toBe(
      "not-handled",
    );
  });

  it("ignores non-GET requests", async () => {
    expect(
      await sw.dispatchFetch(
        makeRequest("/cards/S-14.png", { method: "POST" }),
      ),
    ).toBe("not-handled");
  });
});
