import { Card, CardSuits, CardValues } from "../models/card";
import { swap } from "./array";
import { randInt } from "./random";

const GenerateDeck = (
  shuffleIndices: number[],
  numberOfPlayers: number,
): Card[] => {
  if (shuffleIndices.length !== numberOfPlayers * CardValues.length - 1) {
    throw new Error(
      `Invalid shuffle indices length, got ${shuffleIndices.length}, expected ${numberOfPlayers * CardValues.length - 1}`,
    );
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

function GenerateShuffleIndices(numberOfPlayers: number): number[] {
  const numberOfIndices = numberOfPlayers * CardValues.length - 1;

  const shuffleIndices = [];
  for (let i = numberOfIndices; i >= 1; i--) {
    shuffleIndices.push(randInt(0, i));
  }

  return shuffleIndices;
}

const deckCache = new Map<string, Card[]>();

const GetCardN = (
  shuffleIndices: number[],
  numberOfPlayers: number,
  n: number,
): Card => {
  const paramHash = shuffleIndices.join("") + numberOfPlayers;

  let deck = deckCache.get(paramHash);
  if (!deck) {
    deck = GenerateDeck(shuffleIndices, numberOfPlayers);

    deckCache.set(paramHash, deck);
  }

  return deck[n];
};

export { GenerateDeck, GenerateShuffleIndices, GetCardN };
