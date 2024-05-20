import { Card, CardSuits, CardValues } from "../models/card";
import { swap } from "./array";
import { randInt } from "./random";

const GenerateDeck = (
  shuffleIndices: number[],
  numberOfPlayers: number,
): Card[] => {
  if (shuffleIndices.length !== numberOfPlayers * CardValues.length) {
    throw new Error("Number of players and shuffle indices mismatch!");
  }

  const deck: Card[] = [];

  for (let i = 0; i < numberOfPlayers; i++) {
    for (const v of CardValues) {
      deck.push({ value: v, suit: CardSuits[i] });
    }
  }

  const deckSize = deck.length;

  for (let i = deckSize - 1; i >= 1; i--) {
    const j = shuffleIndices[deckSize - 1 - i];
    swap(deck, i, j);
  }

  return deck;
};

const GenerateShuffleIndices = (numberOfPlayers: number): number[] => {
  const numberOfIndices = numberOfPlayers * CardValues.length;

  const shuffleIndices = [];
  for (let i = numberOfIndices; i >= 1; i--) {
    shuffleIndices.push(randInt(0, i));
  }

  return shuffleIndices;
};

export { GenerateDeck, GenerateShuffleIndices };
