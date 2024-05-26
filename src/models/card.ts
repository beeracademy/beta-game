const CardValues = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14];
const CardSuits = ["S", "C", "H", "D", "A", "I"];

type CardValue = (typeof CardValues)[number];
type CardSuit = (typeof CardSuits)[number];

interface Card {
  value: CardValue;
  suit: CardSuit;

  start_delta_ms?: number;
  chug_start_start_delta_ms?: number;
  chug_end_start_delta_ms?: number;
}

const getCardASCIISymbol = (card: Card): string => {
  switch (card.suit) {
    case "S":
      return "♠";
    case "C":
      return "♣";
    case "H":
      return "♥";
    case "D":
      return "♦";
    case "A":
      return "☘";
    case "I":
      return "🟊";
    default:
      return "";
  }
};

const getCardSuitColor = (card: Card, mode: "dark" | "light"): string => {
  switch (card.suit) {
    case "S":
      return mode === "dark" ? "#a4a4a4" : "#000";
    case "C":
      return mode === "dark" ? "#a4a4a4" : "#000";
    case "H":
      return mode === "dark" ? "#962e31" : "#ac181c";
    case "D":
      return mode === "dark" ? "#962e31" : "#ac181c";
    case "A":
      return "#84be79";
    case "I":
      return "#84be79";
    default:
      return "";
  }
};

const getCardSuitName = (card: Card): string => {
  switch (card.suit) {
    case "S":
      return "Spades";
    case "C":
      return "Clubs";
    case "H":
      return "Hearts";
    case "D":
      return "Diamonds";
    case "A":
      return "Carls";
    case "I":
      return "Heineken";
    default:
      return "";
  }
};

const getCardImageURI = (card?: Card): string => {
  return card ? `/cards/${card.suit}-${card.value}.png` : "";
};

export {
  CardSuits,
  CardValues,
  getCardASCIISymbol,
  getCardImageURI,
  getCardSuitColor,
  getCardSuitName,
};
export type { Card, CardSuit, CardValue };
