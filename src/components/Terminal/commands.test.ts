import { beforeEach, describe, expect, it, vi } from "vitest";
import { customCommands } from "./commands";
import useGame from "../../stores/game";
import * as sounds from "../../hooks/sounds";

vi.mock("../../hooks/sounds", () => ({
  play: vi.fn(),
  stopAll: vi.fn(),
  SoundNames: ["click", "pop", "doublekill"],
}));

describe("Terminal custom commands", () => {
  const mockBuffer = {
    write: vi.fn(),
    clear: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("game command", () => {
    const gameCmd = customCommands.find((c) => c.name === "game")!;

    it("displays usage when no arguments provided", () => {
      gameCmd.execute([], mockBuffer);
      expect(mockBuffer.write).toHaveBeenCalledWith(
        "Usage: game <i>command</i>",
      );
    });

    it("draws a card when 'draw' subcommand is executed", () => {
      vi.spyOn(useGame.getState(), "DrawCard").mockReturnValueOnce([
        { suit: "S", value: 10 },
        12,
      ]);

      gameCmd.execute(["draw"], mockBuffer);
      expect(mockBuffer.write).toHaveBeenCalledWith("You drew 10 of Spades!");
    });
  });

  describe("sound command", () => {
    const soundCmd = customCommands.find((c) => c.name === "sound")!;

    it("displays usage when no arguments provided", () => {
      soundCmd.execute([], mockBuffer);
      expect(mockBuffer.write).toHaveBeenCalledWith(
        "Usage: sound <i>command</i>",
      );
    });

    it("plays sound when 'play' subcommand is executed", () => {
      soundCmd.execute(["play", "click", "--loop"], mockBuffer);
      expect(mockBuffer.write).toHaveBeenCalledWith("Playing sound...");
      expect(sounds.play).toHaveBeenCalledWith("click", { loop: true });
    });

    it("stops sounds when 'stop' subcommand is executed", () => {
      soundCmd.execute(["stop"], mockBuffer);
      expect(mockBuffer.write).toHaveBeenCalledWith("Stopping all sounds...");
      expect(sounds.stopAll).toHaveBeenCalled();
    });

    it("lists available sounds", () => {
      soundCmd.execute(["list"], mockBuffer);
      expect(mockBuffer.write).toHaveBeenCalledWith("Available sounds:");
      expect(mockBuffer.write).toHaveBeenCalledWith("click, pop, doublekill");
    });
  });

  describe("old command", () => {
    const oldCmd = customCommands.find((c) => c.name === "old")!;

    it("plays sound, writes message only when toggling on, and toggles grayscale class", () => {
      document.body.classList.remove("old");
      document.documentElement.classList.remove("old");

      oldCmd.execute([], mockBuffer);
      expect(mockBuffer.write).toHaveBeenCalledTimes(1);
      expect(mockBuffer.write).toHaveBeenCalledWith("Hula bula!");
      expect(sounds.play).toHaveBeenCalledTimes(1);
      expect(sounds.play).toHaveBeenCalledWith("old");
      expect(document.body.classList.contains("old")).toBe(true);
      expect(document.documentElement.classList.contains("old")).toBe(true);

      // Toggle off
      oldCmd.execute([], mockBuffer);
      expect(mockBuffer.write).toHaveBeenCalledTimes(1);
      expect(sounds.play).toHaveBeenCalledTimes(1);
      expect(document.body.classList.contains("old")).toBe(false);
      expect(document.documentElement.classList.contains("old")).toBe(false);
    });
  });

  describe("downunder command", () => {
    const downunderCmd = customCommands.find((c) => c.name === "downunder")!;

    it("plays sound, writes greeting only when toggling on, and toggles downunder class", () => {
      document.documentElement.classList.remove("downunder");

      downunderCmd.execute([], mockBuffer);
      expect(mockBuffer.write).toHaveBeenCalledTimes(1);
      expect(mockBuffer.write).toHaveBeenCalledWith(
        "G'day mate! Welcome to the land Down Under! 🦘",
      );
      expect(sounds.play).toHaveBeenCalledTimes(1);
      expect(sounds.play).toHaveBeenCalledWith("downunder");
      expect(document.documentElement.classList.contains("downunder")).toBe(
        true,
      );

      // Toggle off
      downunderCmd.execute([], mockBuffer);
      expect(mockBuffer.write).toHaveBeenCalledTimes(1);
      expect(sounds.play).toHaveBeenCalledTimes(1);
      expect(document.documentElement.classList.contains("downunder")).toBe(
        false,
      );
    });
  });
});
