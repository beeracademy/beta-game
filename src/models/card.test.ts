import { describe, expect, it } from "vitest";
import {
  Card,
  CardSuits,
  CardValues,
  getCardASCIISymbol,
  getCardImageURI,
  getCardSuitColor,
  getCardSuitName,
} from "./card";

describe("card model utilities", () => {
  it("defines standard card values and suits", () => {
    expect(CardValues).toEqual([2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14]);
    expect(CardSuits).toEqual(["S", "C", "H", "D", "A", "I"]);
  });

  it("returns correct ASCII symbols for suits", () => {
    expect(getCardASCIISymbol({ suit: "S", value: 10 })).toBe("♠");
    expect(getCardASCIISymbol({ suit: "C", value: 10 })).toBe("♣");
    expect(getCardASCIISymbol({ suit: "H", value: 10 })).toBe("♥");
    expect(getCardASCIISymbol({ suit: "D", value: 10 })).toBe("♦");
    expect(getCardASCIISymbol({ suit: "A", value: 10 })).toBe("☘");
    expect(getCardASCIISymbol({ suit: "I", value: 10 })).toBe("🟊");
    expect(getCardASCIISymbol({ suit: "X" as any, value: 10 })).toBe("");
  });

  it("returns suit colors depending on dark/light theme mode", () => {
    const spade: Card = { suit: "S", value: 14 };
    const heart: Card = { suit: "H", value: 14 };
    const carls: Card = { suit: "A", value: 14 };

    expect(getCardSuitColor(spade, "dark")).toBe("#a4a4a4");
    expect(getCardSuitColor(spade, "light")).toBe("#000");

    expect(getCardSuitColor(heart, "dark")).toBe("#962e31");
    expect(getCardSuitColor(heart, "light")).toBe("#ac181c");

    expect(getCardSuitColor(carls, "dark")).toBe("#84be79");
    expect(getCardSuitColor(carls, "light")).toBe("#84be79");
  });

  it("returns human-readable suit names", () => {
    expect(getCardSuitName({ suit: "S", value: 2 })).toBe("Spades");
    expect(getCardSuitName({ suit: "C", value: 2 })).toBe("Clubs");
    expect(getCardSuitName({ suit: "H", value: 2 })).toBe("Hearts");
    expect(getCardSuitName({ suit: "D", value: 2 })).toBe("Diamonds");
    expect(getCardSuitName({ suit: "A", value: 2 })).toBe("Carls");
    expect(getCardSuitName({ suit: "I", value: 2 })).toBe("Heineken");
    expect(getCardSuitName({ suit: "Z" as any, value: 2 })).toBe("");
  });

  it("formats image URI correctly", () => {
    expect(getCardImageURI({ suit: "H", value: 14 })).toBe("/cards/H-14.png");
    expect(getCardImageURI(undefined)).toBe("");
  });
});
