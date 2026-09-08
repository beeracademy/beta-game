import { afterEach, describe, expect, it, vi } from "vitest";
import { getWsBaseUrl } from "./url";

describe("getWsBaseUrl", () => {
  const originalEnv = import.meta.env.VITE_API_BASE_URL;

  afterEach(() => {
    import.meta.env.VITE_API_BASE_URL = originalEnv;
    vi.restoreAllMocks();
  });

  it("converts http to ws from VITE_API_BASE_URL", () => {
    import.meta.env.VITE_API_BASE_URL = "http://localhost:8000";
    expect(getWsBaseUrl()).toBe("ws://localhost:8000");
  });

  it("converts https to wss from VITE_API_BASE_URL and removes trailing slash", () => {
    import.meta.env.VITE_API_BASE_URL = "https://academy.beer/";
    expect(getWsBaseUrl()).toBe("wss://academy.beer");
  });

  it("preserves already formatted wss VITE_API_BASE_URL", () => {
    import.meta.env.VITE_API_BASE_URL = "wss://custom.domain";
    expect(getWsBaseUrl()).toBe("wss://custom.domain");
  });

  it("falls back to window.location host and protocol when VITE_API_BASE_URL is undefined", () => {
    delete import.meta.env.VITE_API_BASE_URL;
    expect(getWsBaseUrl()).toBe(
      `${window.location.protocol === "https:" ? "wss:" : "ws:"}//${window.location.host}`,
    );
  });
});
