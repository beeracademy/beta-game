import { create } from "zustand";
import { persist } from "zustand/middleware";
import * as GameAPI from "../api/endpoints/game";
import { Card, CardValues } from "../models/card";
import { Player } from "../models/player";
import { GenerateShuffleIndices, GetCardN } from "../utilities/deck";
import { mapToRemote } from "./game.mapper";
import useGamesPlayed from "./gamesPlayed";
import useSettings from "./settings";
/*
    Game state is only for essential game data that is required to resume a game.
    All other derived data should be calculated in the metrics store.
*/

interface GameState {
  id?: number;

  offline: boolean;
  token?: string;

  shuffleIndices: number[];

  sipsInABeer: number;
  numberOfRounds: number;

  gameStartDateString: string;
  gameStartTimestamp: number;
  gameEndTimestamp: number;
  turnStartTimestamp: number;

  players: Player[];

  dnf_player_indexes: number[];

  draws: Card[];

  description?: string;
  image?: string;

  submitted?: boolean;
}

interface GameActions {
  Start: (
    players: Player[],
    options?: {
      sipsInABeer: number;
      numberOfRounds: number;
      offline: boolean;
    },
  ) => Promise<void>;

  SetPlayerDNF: (playerId: number, dnf: boolean) => void;

  StartChug: () => number;
  StopChug: () => number;

  DrawCard: () => [Card, number];

  SetDescription: (description: string) => void;
  SetImage: (image: string | null) => void;

  Submit: (options?: { description?: string }) => Promise<void>;
  PlayAgain: () => Promise<void>;

  Exit: (options?: { dnf: boolean; description?: string }) => void;

  Resume: (state: GameState) => void;
}

const createInitialGameState = (): GameState => ({
  id: undefined,

  offline: false,
  token: undefined,

  shuffleIndices: [],

  sipsInABeer: 14,
  numberOfRounds: 13,

  gameStartDateString: "",
  gameStartTimestamp: 0,
  gameEndTimestamp: 0,
  turnStartTimestamp: 0,

  players: [],

  dnf_player_indexes: [],

  draws: [],

  description: undefined,
  image: undefined,

  submitted: false,
});

const initialState: GameState = createInitialGameState();

const syncRemoteUpdate = (
  state: GameState,
  options?: { dnf?: boolean; has_ended?: boolean; description?: string },
) => {
  if (!state.offline && state.token) {
    GameAPI.postUpdate(
      state.token,
      mapToRemote(state, {
        dnf: options?.dnf ?? false,
        has_ended: options?.has_ended ?? false,
        description: options?.description ?? state.description,
      }),
    ).catch((error) => {
      console.error("[Game]", "Failed to update game state", error);
    });
  }
};

const useGame = create<GameState & GameActions>()(
  persist(
    (set) => ({
      ...createInitialGameState(),

      Start: async (
        players: Player[],
        options?: {
          sipsInABeer?: number;
          numberOfRounds?: number;
          offline?: boolean;
        },
      ) => {
        console.debug("[Game]", "Starting game");

        const {
          sipsInABeer = 14,
          numberOfRounds = 13,
          offline = false,
        } = options ?? {};

        // Disable remote control if it is enabled
        useSettings.setState({
          remoteControl: false,
          remoteToken: undefined,
        });

        // Set up game state
        let id: number | undefined;
        let token: string | undefined;
        let shuffleIndices: number[];
        let gameStartDateString = "";
        let gameStartTimestamp = Date.now();
        let turnStartTimestamp = gameStartTimestamp;

        if (offline) {
          shuffleIndices = GenerateShuffleIndices(players.length);
        } else {
          try {
            const playerTokens = players.map(
              (player) => player.token as string,
            );

            const resp = await GameAPI.postStart(playerTokens, true);

            id = resp.id;
            token = resp.token;

            gameStartDateString = resp.start_datetime;
            gameStartTimestamp =
              Date.parse(resp.start_datetime) || Date.now();
            turnStartTimestamp = gameStartTimestamp;

            shuffleIndices = resp.shuffle_indices;
          } catch (error) {
            console.error("[Game]", "Failed to start game", error);
            return;
          }
        }

        set({
          ...createInitialGameState(),
          id,
          offline,
          token,
          shuffleIndices,
          gameStartDateString,
          gameStartTimestamp,
          turnStartTimestamp,
          sipsInABeer,
          numberOfRounds,
          players,
          submitted: false,
        });

        // Update games played count
        useGamesPlayed.getState().incrementStarted();
      },

      SetPlayerDNF: (playerIndex: number, dnf: boolean) => {
        console.debug("[Game]", `Setting player ${playerIndex} DNF to ${dnf}`);

        const state = useGame.getState();
        if (!state.players[playerIndex]) {
          console.error("[Game]", "Player not found at index", playerIndex);
          return;
        }

        const isCurrentlyDNF = state.dnf_player_indexes.includes(playerIndex);
        if (dnf === isCurrentlyDNF) {
          return;
        }

        const new_dnfs = dnf
          ? [...state.dnf_player_indexes, playerIndex]
          : state.dnf_player_indexes.filter((index) => index !== playerIndex);

        set({
          dnf_player_indexes: new_dnfs,
        });

        syncRemoteUpdate({
          ...state,
          dnf_player_indexes: new_dnfs,
        });
      },

      DrawCard: () => {
        console.debug("[Game]", "Drawing card");

        const state = useGame.getState();

        const latestCard = state.draws[state.draws.length - 1];
        if (
          latestCard &&
          latestCard.value === 14 &&
          !latestCard.chug_end_start_delta_ms
        ) {
          throw new Error("Cannot draw a new card while chugging");
        }

        const cardsLeft: number =
          CardValues.length * state.players.length - state.draws.length;
        if (cardsLeft <= 0) {
          throw new Error("Cannot draw from an empty deck!");
        }

        const cardFromDeck = GetCardN(
          state.shuffleIndices,
          state.players.length,
          state.draws.length,
        );

        // Treat card immutably rather than mutating cached deck object
        const card: Card = {
          ...cardFromDeck,
          start_delta_ms: Math.max(0, Date.now() - state.gameStartTimestamp),
        };

        const draws = [...state.draws, card];
        const done = draws.length === CardValues.length * state.players.length;

        const update: Partial<GameState> = {
          draws,
        };

        if (done) {
          console.debug("[Game]", "Last card drawn");
          update.gameEndTimestamp = Date.now();
        }

        // Don't update turn start timestamp if a chug has been drawn
        if (card.value !== 14) {
          update.turnStartTimestamp = Date.now();
        }

        set(update);

        syncRemoteUpdate({
          ...state,
          ...update,
        });

        return [card, cardsLeft - 1];
      },

      StartChug: () => {
        console.debug("[Game]", "Starting chug");

        const now = Date.now();
        const state = useGame.getState();

        const latestCard = state.draws[state.draws.length - 1];

        // check if latest card is an Ace
        if (!latestCard || latestCard.value !== 14) {
          throw new Error("Last card is not an Ace");
        }

        // check if chug has already started
        if (latestCard.chug_start_start_delta_ms !== undefined) {
          throw new Error("Chug has already started");
        }

        const updatedCard: Card = {
          ...latestCard,
          chug_start_start_delta_ms: Math.max(
            0,
            now - state.gameStartTimestamp,
          ),
        };

        const draws = [...state.draws.slice(0, -1), updatedCard];

        set({ draws });

        syncRemoteUpdate({
          ...state,
          draws,
        });

        return now;
      },

      StopChug: () => {
        console.debug("[Game]", "Stopping chug");

        const now = Date.now();
        const state = useGame.getState();

        const latestCard = state.draws[state.draws.length - 1];

        // check if latest card is an Ace
        if (!latestCard || latestCard.value !== 14) {
          throw new Error("Last card is not an Ace");
        }

        // check if chug has already started
        if (latestCard.chug_start_start_delta_ms === undefined) {
          throw new Error("Chug has not started yet");
        }

        // check if chug has already ended
        if (latestCard.chug_end_start_delta_ms !== undefined) {
          throw new Error("Chug has already ended");
        }

        const updatedCard: Card = {
          ...latestCard,
          chug_end_start_delta_ms: Math.max(
            0,
            now - state.gameStartTimestamp,
          ),
        };

        const draws = [...state.draws.slice(0, -1), updatedCard];
        const isLastCard =
          draws.length === CardValues.length * state.players.length;

        const update: Partial<GameState> = {
          draws,
          turnStartTimestamp: now,
          ...(isLastCard ? { gameEndTimestamp: now } : {}),
        };

        set(update);

        syncRemoteUpdate({
          ...state,
          ...update,
        });

        return now;
      },

      SetDescription: (description: string) => {
        set({ description });
      },

      SetImage: (image: string | null) => {
        set({ image: image ?? undefined });
      },

      Submit: async (options?: { description?: string }) => {
        console.debug("[Game]", "Submitting game");
        const state = useGame.getState();
        const desc = options?.description ?? state.description;
        if (options?.description !== undefined) {
          set({ description: options.description });
        }

        if (!state.offline && state.token && state.id) {
          try {
            await GameAPI.postUpdate(
              state.token,
              mapToRemote(state, {
                dnf: false,
                has_ended: true,
                description: desc,
              }),
            );
          } catch (error) {
            console.error("[Game]", "Failed to update game state on submit", error);
          }
        }

        set({ submitted: true });
      },

      PlayAgain: async () => {
        console.debug("[Game]", "Playing again with same players");
        const state = useGame.getState();
        await state.Start(state.players, {
          sipsInABeer: state.sipsInABeer,
          numberOfRounds: state.numberOfRounds,
          offline: state.offline,
        });
      },

      Exit: (options?: { dnf?: boolean; description?: string }) => {
        console.debug("[Game]", "Exiting game");

        const state = useGame.getState();
        const dnf = options?.dnf ?? false;
        const description = options?.description ?? state.description;

        if (!state.offline && !state.submitted && state.token) {
          GameAPI.postUpdate(
            state.token,
            mapToRemote(state, {
              dnf,
              has_ended: true,
              description,
            }),
          ).catch((error) => {
            console.error("[Game]", "Failed to update game state", error);
          });
        }

        useGamesPlayed.getState().incrementCompleted();

        set(createInitialGameState());
      },

      Resume: (state: GameState) => {
        console.debug("[Game]", "Resuming game");

        set(state);
      },
    }),
    {
      name: "game",
    },
  ),
);

export default useGame;
export { createInitialGameState, initialState };
export type { GameActions, GameState };
