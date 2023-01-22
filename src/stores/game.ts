import create from "zustand";
import { persist } from "zustand/middleware";
import { Card, CardSuit, CardSuits, CardValue, CardValues } from "../models/card";
import { Chug } from "../models/chug";
import { Player } from "../models/player";
import { GenerateShuffleIndices } from "../utilities/deck";
import useGamesPlayed from "./gamesPlayed";
import * as GameAPI from "../api/endpoints/game";
import { mapToRemote } from "./game.mapper";
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
    turnStartTimestamp: number;

    draws: Card[];

    players: Player[];

    chugs: Chug[];
}

interface GameActions {
    Start: (players: Player[]) => Promise<void>;
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
                }
            ) => {
                console.debug("[Game]", "Starting game");

                // Disable remote control if it is enabled

                useSettings.setState({
                    remoteControl: false,
                    remoteToken: undefined,
                })

                // Set up game state

                let id = undefined;
                let gameStartTimestamp = Date.now();
                let turnStartTimestamp = Date.now();
                let shuffleIndices = GenerateShuffleIndices(players.length);
                let token = undefined;

                if (!options.offline) {
                    const playerTokens = players.map((player) => player.token as string);

                    const resp = await GameAPI.postStart(playerTokens, true);

                    id = resp.id;
                    token = resp.token;
                    gameStartTimestamp = Date.parse(resp.start_datetime);
                    shuffleIndices = resp.shuffle_indices;
                }

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

                const suit = CardSuits[Math.floor(Math.random() * 4)];
                const value = CardValues[Math.floor(Math.random() * 13)];

                const card = {
                    suit: suit,
                    value: value,
                };

                set((state) => {
                    const updates = {
                        turnStartTimestamp: Date.now(),
                        draws: [...state.draws, card],
                    };

                    if (!state.offline) {
                        GameAPI.postUpdate(
                            mapToRemote({
                                ...state,
                                ...updates,
                            })
                        );
                    }

                    return updates;
                });

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
        }
    )
);

export default useGame;
export { initialState };
export type { GameState, GameActions };
