import { Card, CardSuits, CardValues } from "../models/card";
import { swap } from "./array";
import { randInt } from "./random";

const deckCache = new Map<string, Card[]>();

const GenerateDeck = (
  shuffleIndices: number[],
  numberOfPlayers: number,
): Card[] => {
  if (shuffleIndices.length !== numberOfPlayers * CardValues.length - 1) {
    throw new Error(
      `Invalid shuffle indices length, got ${shuffleIndices.length}, expected ${numberOfPlayers * CardValues.length - 1}`,
    );
  }

  const cacheKey = shuffleIndices.join("") + numberOfPlayers;
  if (deckCache.has(cacheKey)) {
    return deckCache.get(cacheKey) as Card[];
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

  deckCache.set(cacheKey, deck);

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

const GetCardN = (
  shuffleIndices: number[],
  numberOfPlayers: number,
  n: number,
): Card => {
  const deck = GenerateDeck(shuffleIndices, numberOfPlayers);

  return deck[n];
};

const GetSumOfNHighestCards = (cards: Card[], n: number): number => {
  if (n === 0) {
    return 0;
  }

  if (n > cards.length) {
    throw new Error("n should be less than or equal to the number of cards");
  }

  return cards
    .sort((a, b) => a.value - b.value)
    .slice(-n)
    .reduce((acc, card) => acc + card.value, 0);
};

const GetSumOfNLowestCards = (cards: Card[], n: number): number => {
  if (n === 0) {
    return 0;
  }

  if (n > cards.length) {
    throw new Error("n should be less than or equal to the number of cards");
  }

  return cards
    .sort((a, b) => a.value - b.value)
    .slice(0, n)
    .reduce((acc, card) => acc + card.value, 0);
};

export {
  GenerateDeck,
  GenerateShuffleIndices,
  GetCardN,
  GetSumOfNHighestCards,
  GetSumOfNLowestCards,
};
