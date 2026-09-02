import { describe, expect, it } from "vitest";
import { randInt } from "./random";

describe("random utility", () => {
  it("generates integers within inclusive bounds", () => {
    for (let i = 0; i < 50; i++) {
      const val = randInt(1, 10);
      expect(val).toBeGreaterThanOrEqual(1);
      expect(val).toBeLessThanOrEqual(10);
      expect(Number.isInteger(val)).toBe(true);
    }
  });

  it("returns exact bound when min equals max", () => {
    expect(randInt(5, 5)).toBe(5);
  });
});
