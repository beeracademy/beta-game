import { describe, expect, it } from "vitest";
import { swap } from "./array";

describe("array swap utility", () => {
  it("swaps two elements in an array in place", () => {
    const arr = [1, 2, 3, 4];
    swap(arr, 0, 3);
    expect(arr).toEqual([4, 2, 3, 1]);
  });

  it("handles swapping an element with itself", () => {
    const arr = ["a", "b", "c"];
    swap(arr, 1, 1);
    expect(arr).toEqual(["a", "b", "c"]);
  });
});
