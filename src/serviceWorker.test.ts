import { describe, expect, it } from "vitest";
import swContent from "../public/sw.js?raw";

describe("Service Worker (public/sw.js)", () => {
  it("loads raw service worker content", () => {
    expect(swContent.length).toBeGreaterThan(0);
  });

  it("defines versioned CACHE_NAME", () => {
    expect(swContent).toContain("const CACHE_NAME =");
  });

  it("registers essential service worker event listeners", () => {
    expect(swContent).toMatch(/self\.addEventListener\(["']install["']/);
    expect(swContent).toMatch(/self\.addEventListener\(["']activate["']/);
    expect(swContent).toMatch(/self\.addEventListener\(["']fetch["']/);
    expect(swContent).toMatch(/self\.addEventListener\(["']message["']/);
  });

  it("skips waiting immediately on install for non-blocking readiness", () => {
    expect(swContent).toContain("self.skipWaiting()");
  });

  it("claims clients immediately upon activation", () => {
    expect(swContent).toContain("self.clients.claim()");
  });

  it("checks existing cache before fetching to respect caching", () => {
    expect(swContent).toContain("cache.match(url");
    expect(swContent).toContain("if (!match)");
  });

  it("supports preferred audio format optimization (ogg vs mp3)", () => {
    expect(swContent).toMatch(
      /audioFormat === ["']mp3["'] \? ["']mp3["'] : ["']ogg["']/,
    );
    expect(swContent).toContain("`/sounds/${sound}.${format}`");
  });

  it("bypasses API, WebSocket, and Vite dev server paths", () => {
    expect(swContent).toMatch(/url\.pathname\.startsWith\(["']\/api\/["']\)/);
    expect(swContent).toMatch(
      /url\.pathname\.startsWith\(["']\/api-token-auth["']\)/,
    );
    expect(swContent).toMatch(/url\.pathname\.startsWith\(["']\/ws["']\)/);
    expect(swContent).toMatch(/url\.pathname\.startsWith\(["']\/@vite["']\)/);
    expect(swContent).toMatch(/url\.pathname\.startsWith\(["']\/src\/["']\)/);
  });

  it("provides offline fallback for navigation requests", () => {
    expect(swContent).toMatch(/request\.mode === ["']navigate["']/);
    expect(swContent).toMatch(/caches\.match\(["']\/index\.html["']/);
  });
});
