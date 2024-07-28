import { create } from "zustand";
import { Card } from "../models/card";
import {
  GenerateDeck,
  GetSumOfNHighestCards,
  GetSumOfNLowestCards,
} from "../utilities/deck";
import useGame from "./game";

interface PlayerMetrics {
  totalTime: number;

  cardsDrawn: number;

  totalSips: number;
  maxSips: number;
  minSips: number;
  cumulativeSips: number[];

  numberOfBeers: number;
  numberOfChugs: number;

  // Only updated in the beginning of a new round
  isLeading: boolean;
  isLast: boolean;
}

interface GameMetrics {
  latestCard?: Card;

  numberOfCards: number;
  numberOfCardsDrawn: number;

  currentRound: number;

  numberOfPlayers: number;
  activePlayerIndex: number;

  done: boolean;

  chugging: boolean;
}

interface GameMetricActions {
  GetElapsedGameTime(): number;
  GetElapsedTurnTime(): number;
}

interface MetricsState {
  players: PlayerMetrics[];
  game: GameMetrics & GameMetricActions;
}

interface MetricsActions {
  Update(): void;
}

const initialState: MetricsState = {
  players: [],
  game: {
    numberOfCards: 0,
    numberOfCardsDrawn: 0,

    currentRound: 1,

    numberOfPlayers: 0,
    activePlayerIndex: 0,

    done: false,

    chugging: false,

    GetElapsedGameTime: () => 0,
    GetElapsedTurnTime: () => 0,
  },
};

const MetricsStore = create<MetricsState & MetricsActions>()((set, get) => ({
  ...initialState,

  Update: () => {
    console.debug("[Metrics]", "updating");

    const game = useGame.getState();

    if (game.players.length === 0) {
      return;
    }

    /*
    Calculate game metrics
    */

    const deck = GenerateDeck(game.shuffleIndices, game.players.length);
    const cardsDrawn = game.draws;
    const cardsRemaining = deck.slice(cardsDrawn.length);

    const latestCard = cardsDrawn[cardsDrawn.length - 1];
    const chugging =
      latestCard?.value === 14 && !latestCard.chug_end_start_delta_ms;

    const numberOfCards = deck.length;
    const numberOfCardsDrawn = cardsDrawn.length;

    const done = numberOfCardsDrawn === numberOfCards;

    const currentRound = Math.min(
      Math.floor(numberOfCardsDrawn / game.players.length) + 1,
      13,
    );

    const numberOfPlayers = game.players.length;

    const activePlayerIndex =
      (chugging ? numberOfCardsDrawn - 1 : numberOfCardsDrawn) %
      numberOfPlayers;

    /*
      Calculate player metrics
    */

    const currentPlayerMetrics = get().players;

    const firstTimeCalculating = currentPlayerMetrics.length === 0;
    const currentPlayerIndex = cardsDrawn.length % game.players.length;

    const cumulativeSips = cardsDrawn.reduce<number[][]>(
      (acc, card, index) => {
        const playerIndex = index % game.players.length;

        acc[playerIndex].push(
          (acc[playerIndex][acc[playerIndex].length - 1] || 0) + card.value,
        );

        return acc;
      },
      Array.from({ length: game.players.length }, () => [0]),
    );

    const totalSips = cumulativeSips.map(
      (cumulativeSips) => cumulativeSips[cumulativeSips.length - 1],
    );

    const numberOfBeers = totalSips.map((totalSips) =>
      Math.floor(totalSips / game.sipsInABeer),
    );

    const numberOfChugs = cardsDrawn.reduce<number[]>(
      (acc, card, index) => {
        const playerIndex = index % game.players.length;

        if (card.value === 14) {
          acc[playerIndex]++;
        }

        return acc;
      },
      Array.from({ length: game.players.length }, () => 0),
    );

    const totalTime = game.players.map((_, index) => {
      let duration = 0;

      for (let i = 0; i < cardsDrawn.length; i++) {
        if (i % game.players.length !== index) {
          continue;
        }

        const card = cardsDrawn[i];
        const previousCard = cardsDrawn[i - 1];

        if (!card.start_delta_ms) {
          continue;
        }

        if (i === 0) {
          duration += card.start_delta_ms;
          continue;
        }

        if (!previousCard.start_delta_ms) {
          continue;
        }

        let start = previousCard.start_delta_ms;
        let end = card.start_delta_ms;

        if (card.value === 14) {
          if (!card.chug_end_start_delta_ms) {
            continue;
          }

          end = card.chug_end_start_delta_ms;
        }

        duration += end - start;
      }

      return duration;
    });

    const playerNumberOfCardsDrawn = cardsDrawn.reduce<number[]>(
      (acc, _, index) => {
        const playerIndex = index % game.players.length;

        acc[playerIndex]++;

        return acc;
      },
      Array.from({ length: game.players.length }, () => 0),
    );

    const playerNumberOfCardsLeft = playerNumberOfCardsDrawn.map(
      (numberOfCardsDrawn) => 13 - numberOfCardsDrawn,
    );

    const maxSips = game.players.map(
      (_, index) =>
        GetSumOfNHighestCards(cardsRemaining, playerNumberOfCardsLeft[index]) +
        totalSips[index],
    );

    const minSips = game.players.map(
      (_, index) =>
        GetSumOfNLowestCards(cardsRemaining, playerNumberOfCardsLeft[index]) +
        totalSips[index],
    );

    const leadingPlayerIndex = totalSips.indexOf(Math.max(...totalSips));
    const lastPlayerIndex = totalSips.indexOf(Math.min(...totalSips));

    // Get the current metrics for each player

    const playerMetrics: PlayerMetrics[] = game.players.map((_, index) => ({
      ...currentPlayerMetrics[index],

      cardsDrawn: playerNumberOfCardsDrawn[index],

      totalSips: totalSips[index],
      cumulativeSips: cumulativeSips[index],

      maxSips: maxSips[index],
      minSips: minSips[index],

      totalTime: totalTime[index],

      numberOfBeers: numberOfBeers[index],
      numberOfChugs: numberOfChugs[index],

      // Only updated in the beginning of a new round, or first time calculating metrics
      ...((currentPlayerIndex === 0 || firstTimeCalculating) &&
        numberOfCardsDrawn !== 0 && {
          isLeading: index === leadingPlayerIndex && index !== lastPlayerIndex,
          isLast: index === lastPlayerIndex && index !== leadingPlayerIndex,
        }),
    }));

    /*
      Update the metrics store state
    */

    set((state) => ({
      players: playerMetrics,
      game: {
        ...state.game,

        latestCard: latestCard,

        numberOfCards: numberOfCards,
        numberOfCardsDrawn: numberOfCardsDrawn,

        currentRound: currentRound,

        numberOfPlayers: numberOfPlayers,
        activePlayerIndex: activePlayerIndex,

        done: done,

        chugging: chugging,
      },
    }));
  },

  game: {
    ...initialState.game,

    GetElapsedGameTime: () => {
      const game = useGame.getState();

      if (!game.gameEndTimestamp) {
        return Date.now() - game.gameStartTimestamp;
      } else {
        return game.gameEndTimestamp - game.gameStartTimestamp;
      }
    },

    GetElapsedTurnTime: () => {
      const game = useGame.getState();

      return Date.now() - game.turnStartTimestamp;
    },
  },
}));

useGame.subscribe(() => {
  MetricsStore.getState().Update();
});
MetricsStore.getState().Update();

const usePlayerMetrics = () => {
  return MetricsStore((state) => state.players);
};

const usePlayerMetricsByIndex = (playerIndex: number) => {
  return (
    MetricsStore((state) => state.players[playerIndex]) || {
      totalSips: 0,
      maxSips: 0,
      minSips: 0,
      totalTime: 0,
      isLeading: false,
      isLast: false,
      cumulativeSips: [],
    }
  );
};

const useGameMetrics = () => {
  return MetricsStore((state) => state.game);
};

export {
  MetricsStore,
  useGameMetrics,
  usePlayerMetrics,
  usePlayerMetricsByIndex,
};
export type { GameMetrics, MetricsActions, MetricsState, PlayerMetrics };
