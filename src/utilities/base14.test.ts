import { describe, expect, it } from "vitest";
import { toBase14 } from "./base14";

describe("toBase14", () => {
  it("converts numbers from 0 to 13 to base 14 digits", () => {
    expect(toBase14(0)).toBe("0");
    expect(toBase14(9)).toBe("9");
    expect(toBase14(10)).toBe("A");
    expect(toBase14(11)).toBe("B");
    expect(toBase14(12)).toBe("C");
    expect(toBase14(13)).toBe("D");
  });

  it("converts multi-digit base 14 numbers correctly", () => {
    expect(toBase14(14)).toBe("10");
    expect(toBase14(27)).toBe("1D");
    expect(toBase14(28)).toBe("20");
    expect(toBase14(195)).toBe("DD");
    expect(toBase14(196)).toBe("100");
  });

  it("handles undefined or zero gracefully", () => {
    expect(toBase14(0)).toBe("0");
    expect(toBase14(undefined as unknown as number)).toBeUndefined();
  });
});
