import { create } from "zustand";
import { Card } from "../models/card";
import useGame from "./game";

interface PlayerMetrics {
  totalTime: number;

  totalSips: number;
  maxSips: number;
  minSips: number;
  cumulativeSips: number[];

  numberOfBeers: number;

  // Only updated in the beginning of a new round
  isLeading: boolean;
  isLast: boolean;
}

interface GameMetrics {
  latestCard?: Card;

  numberOfCards: number;
  numberOfCardsDrawn: number;
  numberOfCardsRemaining: number;

  currentRound: number;
  roundsRemaining: number;

  numberOfPlayers: number;
  activePlayerIndex: number;

  done: boolean;

  chugging: boolean;
}

interface MetricsState {
  players: PlayerMetrics[];
  game: GameMetrics;
}

interface MetricsActions {
  Update(): void;
}

const initialState: MetricsState = {
  players: [],
  game: {
    numberOfCards: 0,
    numberOfCardsDrawn: 0,
    numberOfCardsRemaining: 0,

    currentRound: 1,
    roundsRemaining: 0,

    numberOfPlayers: 0,
    activePlayerIndex: 0,

    done: false,

    chugging: false,
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

    const draws = game.draws;

    /*
      Calculate game metrics
    */

    const numberOfCards = game.players.length * game.numberOfRounds;

    const numberOfCardsDrawn = draws.length;
    const numberOfCardsRemaining = numberOfCards - numberOfCardsDrawn;

    const currentRound = Math.min(
      Math.floor(numberOfCardsDrawn / game.players.length) + 1,
      13,
    );
    const roundsRemaining = game.numberOfRounds - currentRound;

    const numberOfPlayers = game.players.length;
    const activePlayerIndex = numberOfCardsDrawn % numberOfPlayers;

    const done = numberOfCardsDrawn === numberOfCards;

    const latestCard = draws[draws.length - 1];
    const chugging =
      latestCard?.value === 14 && !latestCard.chug_end_start_delta_ms;

    /*
      Calculate player metrics
    */

    const currentPlayerMetrics = get().players;
    const firstTimeCalculating = currentPlayerMetrics.length === 0;
    const currentPlayerIndex = draws.length % game.players.length;

    const cumulativeSips = draws.reduce<number[][]>(
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

    const leadingPlayerIndex = totalSips.indexOf(Math.max(...totalSips));
    const lastPlayerIndex = totalSips.indexOf(Math.min(...totalSips));

    // Get the current metrics for each player

    const playerMetrics: PlayerMetrics[] = game.players.map((_, index) => ({
      ...currentPlayerMetrics[index],

      totalSips: totalSips[index],
      cumulativeSips: cumulativeSips[index],
      maxSips: 0,
      minSips: 0,
      totalTime: 0,
      numberOfBeers: numberOfBeers[index],

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

    set({
      players: playerMetrics,
      game: {
        latestCard: latestCard,

        numberOfCards: numberOfCards,
        numberOfCardsDrawn: numberOfCardsDrawn,
        numberOfCardsRemaining: numberOfCardsRemaining,

        currentRound: currentRound,
        roundsRemaining: roundsRemaining,

        numberOfPlayers: numberOfPlayers,
        activePlayerIndex: activePlayerIndex,

        done: done,

        chugging: chugging,
      },
    });
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
