import { renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { getStaticAssets, useAssetsPreloader } from "./preloader";

describe("preloader", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("getStaticAssets", () => {
    it("includes all card images, SVGs, wallpapers, icons, and OGG sounds when format is ogg", () => {
      const assets = getStaticAssets("ogg");

      // Verify SVGs
      expect(assets).toContain("/blackheart.svg");
      expect(assets).toContain("/skull.svg");
      expect(assets).toContain("/wave.svg");
      expect(assets).toContain("/whiteheart.svg");
      expect(assets).toContain("/crown.svg");
      expect(assets).toContain("/jester.svg");

      // Verify wallpapers
      expect(assets).toContain("/wallpaper/1.png");
      expect(assets).toContain("/wallpaper/6.png");

      // Verify card faces
      expect(assets).toContain("/cards/H-14.png");
      expect(assets).toContain("/cards/A-2.png");
      expect(assets).toContain("/cards/cardback.png");

      // Verify sounds are only ogg and not mp3
      const soundAssets = assets.filter((a) => a.startsWith("/sounds/"));
      expect(soundAssets.length).toBeGreaterThan(0);
      expect(soundAssets.every((a) => a.endsWith(".ogg"))).toBe(true);
      expect(soundAssets.some((a) => a.endsWith(".mp3"))).toBe(false);
    });

    it("includes MP3 sounds and no OGG sounds when format is mp3", () => {
      const assets = getStaticAssets("mp3");

      const soundAssets = assets.filter((a) => a.startsWith("/sounds/"));
      expect(soundAssets.length).toBeGreaterThan(0);
      expect(soundAssets.every((a) => a.endsWith(".mp3"))).toBe(true);
      expect(soundAssets.some((a) => a.endsWith(".ogg"))).toBe(false);
    });
  });

  describe("useAssetsPreloader", () => {
    it("initializes without blocking main thread and provides asset counts", () => {
      const { result } = renderHook(() => useAssetsPreloader());

      expect(result.current.total).toBeGreaterThan(0);
      expect(result.current.error).toBe(false);
    });
  });
});
