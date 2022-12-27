interface Card {
  value: CardValue;
  suit: CardSuit;
}

type CardValue = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14;
type CardSuit = "S" | "C" | "H" | "D" | "A" | "I";

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

const getCardSuitColor = (card: Card): string => {
  switch (card.suit) {
      case "S":
          return "#000";
      case "C":
          return "#000";
      case "H":
          return "#e74c3c";
      case "D":
          return "#e74c3c";
      case "A":
          return "#2ecc71";
      case "I":
          return "#2ecc71";
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

const getCardImageURI = (card: Card): string => {
    return `/cards/${card.suit}-${card.value}.png`;
};

export { getCardASCIISymbol, getCardSuitColor, getCardImageURI, getCardSuitName };
export type { Card, CardValue, CardSuit };
