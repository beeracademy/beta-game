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

  DrawCard: () => Card;

  Exit: (options?: { dnf: boolean; description?: string }) => void;

  Resume: (state: GameState) => void;
}

const initialState: GameState = {
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
};

const useGame = create<GameState & GameActions>()(
  persist(
    (set) => ({
      ...initialState,

      Start: async (
        players: Player[],
        options = {
          sipsInABeer: 14,
          numberOfRounds: 13,
          offline: false,
        },
      ) => {
        console.debug("[Game]", "Starting game");

        // Disable remote control if it is enabled

        useSettings.setState({
          remoteControl: false,
          remoteToken: undefined,
        });

        // Set up game state

        let id;
        let token;
        let shuffleIndices: number[];
        let gameStartDateString = "";
        let gameStartTimestamp = Date.now();
        let turnStartTimestamp = Date.now();

        if (options.offline) {
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
            gameStartTimestamp = Date.parse(resp.start_datetime);

            shuffleIndices = resp.shuffle_indices;
          } catch (error) {
            console.error("[Game]", "Failed to start game", error);
            return;
          }
        }

        set({
          id: id,
          offline: options.offline,
          token: token,
          shuffleIndices: shuffleIndices,
          gameStartDateString: gameStartDateString,
          gameStartTimestamp: gameStartTimestamp,
          turnStartTimestamp: turnStartTimestamp,
          sipsInABeer: options.sipsInABeer,
          numberOfRounds: options.numberOfRounds,
          players: players,
        });

        // Update games played count

        useGamesPlayed.getState().incrementStarted();
      },

      SetPlayerDNF: (playerIndex: number, dnf: boolean) => {
        console.debug("[Game]", `Setting player ${playerIndex} DNF to ${dnf}`);

        const state = useGame.getState();

        let player;
        try {
          player = state.players[playerIndex];
        } catch (error) {
          throw new Error("Player not found");
        }

        if (dnf && state.dnf_player_indexes.includes(playerIndex)) {
          return;
        }

        let new_dnfs = [...state.dnf_player_indexes];
        if (dnf) {
          if (state.dnf_player_indexes.includes(playerIndex)) {
            return;
          }

          new_dnfs.push(playerIndex);
        }

        if (!dnf) {
          if (!state.dnf_player_indexes.includes(playerIndex)) {
            return;
          }

          new_dnfs = state.dnf_player_indexes.filter(
            (index) => index !== playerIndex,
          );
        }

        set({
          dnf_player_indexes: new_dnfs,
        });

        try {
          GameAPI.postUpdate(
            state.token as string,
            mapToRemote({
              ...state,
              dnf_player_indexes: new_dnfs,
            }),
          );
        } catch (error) {
          console.error("[Game]", "Failed to update game state", error);
        }
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

        const cardsLeft = (CardValues.length - 1) * state.players.length;
        if (cardsLeft <= 0) {
          throw new Error("Cannot draw from an empty deck!");
        }

        const card = GetCardN(
          state.shuffleIndices,
          state.players.length,
          state.draws.length,
        );

        card.start_delta_ms = Date.now() - state.gameStartTimestamp;

        const draws = [...state.draws, card];

        const done = draws.length === CardValues.length * state.players.length;

        const update: Partial<GameState> = {
          draws: draws,
        };

        if (done) {
          console.debug("[Game]", "Last card drawn");

          update.gameEndTimestamp = Date.now();
        }

        // Don't update turn start timestamp if
        // A chug has been drawn
        if (card.value !== 14) {
          update.turnStartTimestamp = Date.now();
        }

        set(update);

        if (state.offline) {
          return card;
        }

        try {
          GameAPI.postUpdate(
            state.token as string,
            mapToRemote({
              ...state,
              ...update,
            }),
          );
        } catch (error) {
          console.error("[Game]", "Failed to update game state", error);
        } finally {
          return card;
        }
      },

      StartChug: () => {
        console.debug("[Game]", "Starting chug");

        const now = Date.now();
        const state = useGame.getState();

        const latestCard = state.draws[state.draws.length - 1];

        // check if latest card is an Ace
        if (latestCard.value !== 14) {
          throw new Error("Last card is not an Ace");
        }

        // check if chug has already started
        if (latestCard.chug_start_start_delta_ms) {
          throw new Error("Chug has already started");
        }

        // set chug start timestamp
        latestCard.chug_start_start_delta_ms = now - state.gameStartTimestamp;

        const update = {
          draws: [...state.draws.slice(0, -1), latestCard],
        };

        set({
          draws: [...state.draws.slice(0, -1), latestCard],
        });

        try {
          GameAPI.postUpdate(
            state.token as string,
            mapToRemote({
              ...state,
              ...update,
            }),
          );
        } catch (error) {
          console.error("[Game]", "Failed to update game state", error);
        } finally {
          return now;
        }
      },

      StopChug: () => {
        console.debug("[Game]", "Stopping chug");

        const now = Date.now();
        const state = useGame.getState();

        // get latest card
        const latestCard = state.draws[state.draws.length - 1];

        // check if latest card is an Ace
        if (latestCard.value !== 14) {
          throw new Error("Last card is not an Ace");
        }

        // check if chug has already started
        if (!latestCard.chug_start_start_delta_ms) {
          throw new Error("Chug has not started yet");
        }

        // set chug end timestamp
        latestCard.chug_end_start_delta_ms = now - state.gameStartTimestamp;

        const update = {
          draws: [...state.draws.slice(0, -1), latestCard],
        };

        set({
          draws: [...state.draws.slice(0, -1), latestCard],
          turnStartTimestamp: Date.now(),
        });

        try {
          GameAPI.postUpdate(
            state.token as string,
            mapToRemote({
              ...state,
              ...update,
            }),
          );
        } catch (error) {
          console.error("[Game]", "Failed to update game state", error);
        } finally {
          return now;
        }
      },

      Exit: (
        options: {
          dnf: boolean;
          description?: string;
        } = {
          dnf: false,
          description: undefined,
        },
      ) => {
        console.debug("[Game]", "Exiting game");

        const state = useGame.getState();

        if (!state.offline) {
          try {
            GameAPI.postUpdate(
              state.token as string,
              mapToRemote(state, {
                dnf: options.dnf,
                has_ended: true,
                description: options.description,
              }),
            );
          } catch (error) {
            console.error("[Game]", "Failed to update game state", error);
          }
        }

        useGamesPlayed.getState().incrementCompleted();

        set(initialState);
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
export { initialState };
export type { GameActions, GameState };
