import { describe, expect, it } from "vitest";
import {
  pickHypeMessage,
  pickJesterMessage,
  pickKillStreakMessage,
  pickKingMessage,
} from "./messages";

describe("TextFlash messages", () => {
  it("does not return a kill streak message for chug 1 (no 'FINISH HIM!!')", () => {
    expect(pickKillStreakMessage(1)).toBeUndefined();
  });

  it("returns kill streak messages for streaks of 2 or more", () => {
    expect(pickKillStreakMessage(2)).toBe("DOUBLE KILL!!");
    expect(pickKillStreakMessage(3)).toBe("TRIPLE KILL!!");
    expect(pickKillStreakMessage(4)).toBe("ULTRA KILL!!");
    expect(pickKillStreakMessage(5)).toBe("MEGA KILL!!");
    expect(pickKillStreakMessage(6)).toBe("MONSTER KILL!!");
    expect(pickKillStreakMessage(7)).toBeUndefined();
  });

  it("returns hype, king, and jester messages", () => {
    expect(pickHypeMessage()).toBeTruthy();
    expect(pickKingMessage("Player 1")).toContain("Player 1");
    expect(pickJesterMessage("Player 2")).toContain("Player 2");
  });
});
