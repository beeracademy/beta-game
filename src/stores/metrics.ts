import { create } from "zustand";
import { type Card, CardValues } from "../models/card";
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

const DEFAULT_PLAYER_METRICS: PlayerMetrics = {
  totalTime: 0,
  cardsDrawn: 0,
  totalSips: 0,
  maxSips: 0,
  minSips: 0,
  cumulativeSips: [],
  numberOfBeers: 0,
  numberOfChugs: 0,
  isLeading: false,
  isLast: false,
};

// Stable across the app's lifetime so resetting the metrics state (e.g. when a new
// game starts) never leaves the game slice with stale/no-op implementations.
const GetElapsedGameTime = (): number => {
  const game = useGame.getState();

  if (!game.gameStartTimestamp) {
    return 0;
  }

  if (!game.gameEndTimestamp) {
    return Math.max(0, Date.now() - game.gameStartTimestamp);
  } else {
    return Math.max(0, game.gameEndTimestamp - game.gameStartTimestamp);
  }
};

const GetElapsedTurnTime = (): number => {
  const game = useGame.getState();
  const metrics = MetricsStore.getState();

  if (metrics.game.done) {
    return 0;
  }

  if (!game.turnStartTimestamp) {
    return 0;
  }

  return Math.max(0, Date.now() - game.turnStartTimestamp);
};

const createInitialMetricsState = (): MetricsState => ({
  players: [],
  game: {
    numberOfCards: 0,
    numberOfCardsDrawn: 0,

    currentRound: 1,

    numberOfPlayers: 0,
    activePlayerIndex: 0,

    done: false,

    chugging: false,

    GetElapsedGameTime,
    GetElapsedTurnTime,
  },
});

const initialState: MetricsState = createInitialMetricsState();

function calculatePlayerSips(
  playersCount: number,
  cardsDrawn: Card[],
  sipsInABeer: number,
) {
  const cumulativeSips = cardsDrawn.reduce<number[][]>(
    (acc, card, index) => {
      const playerIndex = index % playersCount;
      const prevSips = acc[playerIndex][acc[playerIndex].length - 1] || 0;
      acc[playerIndex].push(prevSips + card.value);
      return acc;
    },
    Array.from({ length: playersCount }, () => [0]),
  );

  const totalSips = cumulativeSips.map((sips) => sips[sips.length - 1]);

  const numberOfBeers = totalSips.map((sips) =>
    Math.floor(sips / (sipsInABeer || 14)),
  );

  return { cumulativeSips, totalSips, numberOfBeers };
}

function calculatePlayerChugs(playersCount: number, cardsDrawn: Card[]) {
  return cardsDrawn.reduce<number[]>(
    (acc, card, index) => {
      if (card.value === 14) {
        acc[index % playersCount]++;
      }
      return acc;
    },
    Array.from({ length: playersCount }, () => 0),
  );
}

function calculatePlayerTurnTimes(
  playersCount: number,
  cardsDrawn: Card[],
): number[] {
  const totalTimes = Array.from({ length: playersCount }, () => 0);

  for (let i = 0; i < cardsDrawn.length; i++) {
    const playerIndex = i % playersCount;
    const card = cardsDrawn[i];

    if (card.start_delta_ms === undefined) {
      continue;
    }

    // Determine start of this turn:
    // Card 0 turn starts at game start (delta 0).
    // Subsequent cards start after previous card finished.
    // If previous card was an Ace with completed chug, turn started at chug_end_start_delta_ms.
    let turnStartDelta = 0;
    if (i > 0) {
      const previousCard = cardsDrawn[i - 1];
      if (previousCard.start_delta_ms === undefined) {
        continue;
      }
      if (
        previousCard.value === 14 &&
        previousCard.chug_end_start_delta_ms !== undefined
      ) {
        turnStartDelta = previousCard.chug_end_start_delta_ms;
      } else {
        turnStartDelta = previousCard.start_delta_ms;
      }
    }

    // Determine end of this turn:
    // If Ace: ends at chug_end_start_delta_ms once chug is completed.
    // Otherwise: ends at card.start_delta_ms.
    let turnEndDelta: number;
    if (card.value === 14) {
      if (card.chug_end_start_delta_ms === undefined) {
        // Chug is currently in progress; turn duration not yet finalized
        continue;
      }
      turnEndDelta = card.chug_end_start_delta_ms;
    } else {
      turnEndDelta = card.start_delta_ms;
    }

    const duration = Math.max(0, turnEndDelta - turnStartDelta);
    totalTimes[playerIndex] += duration;
  }

  return totalTimes;
}

function calculateCardsPerPlayer(
  playersCount: number,
  cardsDrawnCount: number,
  numberOfRounds: number,
) {
  const cardsDrawn = Array.from({ length: playersCount }, () => 0);
  for (let i = 0; i < cardsDrawnCount; i++) {
    cardsDrawn[i % playersCount]++;
  }

  const cardsLeft = cardsDrawn.map((count) =>
    Math.max(0, numberOfRounds - count),
  );

  return { cardsDrawn, cardsLeft };
}

function calculateMinMaxSips(
  playersCount: number,
  cardsRemaining: Card[],
  cardsLeft: number[],
  totalSips: number[],
) {
  const maxSips = Array.from({ length: playersCount }, (_, index) => {
    return (
      GetSumOfNHighestCards(cardsRemaining, cardsLeft[index]) + totalSips[index]
    );
  });

  const minSips = Array.from({ length: playersCount }, (_, index) => {
    return (
      GetSumOfNLowestCards(cardsRemaining, cardsLeft[index]) + totalSips[index]
    );
  });

  return { maxSips, minSips };
}

function calculateLeaderboard(totalSips: number[]) {
  if (totalSips.length === 0) {
    return { isLeading: [], isLast: [] };
  }

  const maxSips = Math.max(...totalSips);
  const minSips = Math.min(...totalSips);

  // If all players have equal sips, nobody is leading or last
  if (maxSips === minSips) {
    return {
      isLeading: totalSips.map(() => false),
      isLast: totalSips.map(() => false),
    };
  }

  return {
    isLeading: totalSips.map((sips) => sips === maxSips),
    isLast: totalSips.map((sips) => sips === minSips),
  };
}

const MetricsStore = create<MetricsState & MetricsActions>()((set, get) => ({
  ...createInitialMetricsState(),

  Update: () => {
    console.debug("[Metrics]", "updating");

    const game = useGame.getState();

    // Reset store if no active players
    if (game.players.length === 0) {
      set(createInitialMetricsState());
      return;
    }

    const numberOfPlayers = game.players.length;
    const numberOfRounds = game.numberOfRounds || 13;
    const expectedDeckSize = numberOfPlayers * CardValues.length;

    // Guard against unpopulated or transitioning shuffle indices
    if (game.shuffleIndices.length !== expectedDeckSize - 1) {
      return;
    }

    /*
      Calculate game metrics
    */

    const deck = GenerateDeck(game.shuffleIndices, numberOfPlayers);
    const cardsDrawn = game.draws;
    const cardsRemaining = deck.slice(cardsDrawn.length);

    const latestCard = cardsDrawn[cardsDrawn.length - 1];
    const chugging =
      latestCard?.value === 14 && !latestCard.chug_end_start_delta_ms;

    const numberOfCards = deck.length;
    const numberOfCardsDrawn = cardsDrawn.length;

    const done = numberOfCardsDrawn === numberOfCards;

    const currentRound = Math.min(
      Math.floor(numberOfCardsDrawn / numberOfPlayers) + 1,
      numberOfRounds,
    );

    const rawActiveIndex = chugging
      ? numberOfCardsDrawn - 1
      : numberOfCardsDrawn;
    const activePlayerIndex =
      numberOfPlayers > 0
        ? ((rawActiveIndex % numberOfPlayers) + numberOfPlayers) %
          numberOfPlayers
        : 0;

    /*
      Calculate player metrics
    */

    const { cumulativeSips, totalSips, numberOfBeers } = calculatePlayerSips(
      numberOfPlayers,
      cardsDrawn,
      game.sipsInABeer,
    );

    const numberOfChugs = calculatePlayerChugs(numberOfPlayers, cardsDrawn);
    const totalTime = calculatePlayerTurnTimes(numberOfPlayers, cardsDrawn);

    const { cardsDrawn: playerCardsDrawn, cardsLeft: playerCardsLeft } =
      calculateCardsPerPlayer(
        numberOfPlayers,
        numberOfCardsDrawn,
        numberOfRounds,
      );

    const { maxSips, minSips } = calculateMinMaxSips(
      numberOfPlayers,
      cardsRemaining,
      playerCardsLeft,
      totalSips,
    );

    const currentPlayerMetrics = get().players;
    const isNewRoundOrFirstCalculation =
      currentPlayerMetrics.length === 0 ||
      cardsDrawn.length % numberOfPlayers === 0;

    const { isLeading: newLeading, isLast: newLast } =
      calculateLeaderboard(totalSips);

    const playerMetrics: PlayerMetrics[] = game.players.map((_, index) => {
      const prev = currentPlayerMetrics[index];
      const shouldUpdateLeaderboard =
        isNewRoundOrFirstCalculation && numberOfCardsDrawn !== 0;

      return {
        cardsDrawn: playerCardsDrawn[index],
        totalSips: totalSips[index],
        cumulativeSips: cumulativeSips[index],
        maxSips: maxSips[index],
        minSips: minSips[index],
        totalTime: totalTime[index],
        numberOfBeers: numberOfBeers[index],
        numberOfChugs: numberOfChugs[index],
        isLeading: shouldUpdateLeaderboard
          ? newLeading[index]
          : (prev?.isLeading ?? false),
        isLast: shouldUpdateLeaderboard
          ? newLast[index]
          : (prev?.isLast ?? false),
      };
    });

    /*
      Update the metrics store state
    */

    set((state) => ({
      players: playerMetrics,
      game: {
        ...state.game,
        latestCard,
        numberOfCards,
        numberOfCardsDrawn,
        currentRound,
        numberOfPlayers,
        activePlayerIndex,
        done,
        chugging,
      },
    }));
  },

  game: {
    ...initialState.game,
  },
}));

useGame.subscribe((state, prevState) => {
  // Only trigger update when game state affecting metrics has changed
  if (
    state.draws !== prevState.draws ||
    state.players !== prevState.players ||
    state.shuffleIndices !== prevState.shuffleIndices ||
    state.sipsInABeer !== prevState.sipsInABeer ||
    state.numberOfRounds !== prevState.numberOfRounds
  ) {
    MetricsStore.getState().Update();
  }
});
MetricsStore.getState().Update();

const usePlayerMetrics = () => {
  return MetricsStore((state) => state.players);
};

const usePlayerMetricsByIndex = (playerIndex: number): PlayerMetrics => {
  return (
    MetricsStore((state) => state.players[playerIndex]) ||
    DEFAULT_PLAYER_METRICS
  );
};

const useGameMetrics = () => {
  return MetricsStore((state) => state.game);
};

export {
  calculateCardsPerPlayer,
  calculateLeaderboard,
  calculateMinMaxSips,
  calculatePlayerChugs,
  calculatePlayerSips,
  calculatePlayerTurnTimes,
  DEFAULT_PLAYER_METRICS,
  MetricsStore,
  useGameMetrics,
  usePlayerMetrics,
  usePlayerMetricsByIndex,
};
export type { GameMetrics, MetricsActions, MetricsState, PlayerMetrics };
