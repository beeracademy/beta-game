import { describe, expect, it } from "vitest";
import { GetSumOfNHighestCards, GetSumOfNLowestCards } from "./deck";

describe("GetSumOfNHighestCards", () => {
  const testDeck = [
    { value: 2, suit: "H" },
    { value: 3, suit: "H" },
    { value: 4, suit: "H" },
    { value: 5, suit: "H" },
    { value: 6, suit: "H" },
  ];

  it("should return the sum of the highest n cards", () => {
    expect(GetSumOfNHighestCards(testDeck, 1)).toBe(6);
    expect(GetSumOfNHighestCards(testDeck, 2)).toBe(11);
    expect(GetSumOfNHighestCards(testDeck, 3)).toBe(15);
    expect(GetSumOfNHighestCards(testDeck, 4)).toBe(18);
    expect(GetSumOfNHighestCards(testDeck, 5)).toBe(20);
  });

  it("should return 0 if n is 0", () => {
    expect(GetSumOfNHighestCards(testDeck, 0)).toBe(0);
  });

  it("should throw an error if n is greater than the number of cards", () => {
    expect(() => GetSumOfNHighestCards(testDeck, 6)).toThrowError(
      "n should be less than or equal to the number of cards",
    );
  });
});

describe("GetSumOfNLowestCards", () => {
  const testDeck = [
    { value: 2, suit: "H" },
    { value: 3, suit: "H" },
    { value: 4, suit: "H" },
    { value: 5, suit: "H" },
    { value: 6, suit: "H" },
  ];

  it("should return the sum of the lowest n cards", () => {
    expect(GetSumOfNLowestCards(testDeck, 1)).toBe(2);
    expect(GetSumOfNLowestCards(testDeck, 2)).toBe(5);
    expect(GetSumOfNLowestCards(testDeck, 3)).toBe(9);
    expect(GetSumOfNLowestCards(testDeck, 4)).toBe(14);
    expect(GetSumOfNLowestCards(testDeck, 5)).toBe(20);
  });

  it("should return 0 if n is 0", () => {
    expect(GetSumOfNLowestCards(testDeck, 0)).toBe(0);
  });

  it("should throw an error if n is greater than the number of cards", () => {
    expect(() => GetSumOfNLowestCards(testDeck, 6)).toThrowError(
      "n should be less than or equal to the number of cards",
    );
  });
});
