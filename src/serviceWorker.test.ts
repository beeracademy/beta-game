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
    expect(swContent).toContain("self.addEventListener('install'");
    expect(swContent).toContain("self.addEventListener('activate'");
    expect(swContent).toContain("self.addEventListener('fetch'");
    expect(swContent).toContain("self.addEventListener('message'");
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
    expect(swContent).toContain("audioFormat === 'mp3' ? 'mp3' : 'ogg'");
    expect(swContent).toContain("`/sounds/${sound}.${format}`");
  });

  it("bypasses API, WebSocket, and Vite dev server paths", () => {
    expect(swContent).toContain("url.pathname.startsWith('/api/')");
    expect(swContent).toContain("url.pathname.startsWith('/api-token-auth')");
    expect(swContent).toContain("url.pathname.startsWith('/ws')");
    expect(swContent).toContain("url.pathname.startsWith('/@vite')");
    expect(swContent).toContain("url.pathname.startsWith('/src/')");
  });

  it("provides offline fallback for navigation requests", () => {
    expect(swContent).toContain("request.mode === 'navigate'");
    expect(swContent).toContain("caches.match('/index.html'");
  });
});
