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
      expect(mockBuffer.write).toHaveBeenCalledWith("Usage: game <i>command</i>");
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
      expect(mockBuffer.write).toHaveBeenCalledWith("Usage: sound <i>command</i>");
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
});
