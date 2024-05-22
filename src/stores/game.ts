import { create } from "zustand";
import { persist } from "zustand/middleware";
import * as GameAPI from "../api/endpoints/game";
import { Card, CardValues } from "../models/card";
import { Chug } from "../models/chug";
import { Player } from "../models/player";
import {
  GenerateDeck,
  GenerateShuffleIndices,
  GetCardN,
} from "../utilities/deck";
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

  gameStartTimestamp: number;
  gameEndTimestamp: number;
  turnStartTimestamp: number;

  players: Player[];

  chugs: Chug[];
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
  Draw: () => Card;
  Exit: () => void;
  Resume: (state: GameState) => void;
}

const initialState: GameState = {
  id: undefined,

  offline: false,
  token: undefined,

  shuffleIndices: [],

  sipsInABeer: 14,
  numberOfRounds: 13,

  gameStartTimestamp: 0,
  gameEndTimestamp: 0,
  turnStartTimestamp: 0,

  players: [],

  chugs: [],
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
        let shuffleIndices;
        let gameStartTimestamp = Date.now();
        let turnStartTimestamp = Date.now();

        if (options.offline) {
          shuffleIndices = GenerateShuffleIndices(players.length);
        } else {
          const playerTokens = players.map((player) => player.token as string);

          const resp = await GameAPI.postStart(playerTokens, true);

          id = resp.id;
          token = resp.token;
          gameStartTimestamp = Date.parse(resp.start_datetime);
          shuffleIndices = resp.shuffle_indices;
        }

        const deck = GenerateDeck(shuffleIndices, players.length);

        set({
          id: id,
          offline: options.offline,
          token: token,
          shuffleIndices: shuffleIndices,
          gameStartTimestamp: gameStartTimestamp,
          turnStartTimestamp: turnStartTimestamp,
          sipsInABeer: options.sipsInABeer,
          numberOfRounds: options.numberOfRounds,
          players: players,
          chugs: [],
          draws: [],
        });

        useGamesPlayed.getState().incrementStarted();
      },

      Draw: () => {
        console.debug("[Game]", "Drawing card");

        const state = useGame.getState();

        const deck = GenerateDeck(state.shuffleIndices, state.players.length);

        if (deck.length === 0) {
          throw new Error("Cannot draw from an empty deck!");
        }

        const card = GetCardN(
          state.shuffleIndices,
          state.players.length,
          state.draws.length,
        );

        const draws = [...state.draws, card];
        const turnStartTimestamp = Date.now();

        const done =
          draws.length === (CardValues.length - 1) * state.players.length;

        const update: Partial<GameState> = {
          draws: draws,
          turnStartTimestamp: turnStartTimestamp,
        };

        if (done) {
          useGamesPlayed.getState().incrementCompleted();
          update.gameEndTimestamp = Date.now();
        }

        set(update);

        return card;
      },

      Exit: () => {
        console.debug("[Game]", "Exiting game");

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
