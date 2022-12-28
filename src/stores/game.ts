import create from "zustand";
import { persist } from "zustand/middleware";
import { Card, CardSuit, CardSuits, CardValue, CardValues } from "../models/card";
import { Chug } from "../models/chug";
import { Player } from "../models/player";
import { GenerateShuffleIndices } from "../utilities/deck";
import useGamesPlayed from "./gamesPlayed";

/*
    Game state is only for essential game data that is required to resume a game.
    All other derived data should be calculated in the metrics store.
*/

interface GameState {
    shuffleIndices: number[];

    sipsInABeer: number;
    numberOfRounds: number;

    gameStartTimestamp: number;
    turnStartTimestamp: number;

    numberOfDraws: number;

    players: Player[];
    chugs: Chug[];

    // TODO

    draws: Card[];
}

interface GameActions {
    Start: (players: Player[]) => void;
    Draw: () => Card;
    Exit: () => void;
    Resume: (state: GameState) => void;
}

const initialState: GameState = {
    shuffleIndices: [],

    sipsInABeer: 14,
    numberOfRounds: 13,

    gameStartTimestamp: 0,
    turnStartTimestamp: 0,

    numberOfDraws: 0,

    players: [],
    chugs: [],

    draws: [],
};

const useGame = create<GameState & GameActions>()(
    persist(
        (set) => ({
            ...initialState,

            Start: (
                players: Player[],
                options = {
                    sipsInABeer: 14,
                    numberOfRounds: 13,
                }
            ) => {
                console.debug("[Game]", "Starting game");

                set({
                    shuffleIndices: GenerateShuffleIndices(players.length), // TODO
                    gameStartTimestamp: Date.now(),
                    turnStartTimestamp: Date.now(),
                    sipsInABeer: options.sipsInABeer,
                    numberOfRounds: options.numberOfRounds,
                    players: players,
                    chugs: [],
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

                set((state) => ({
                    turnStartTimestamp: Date.now(),
                    numberOfDraws: state.numberOfDraws + 1,
                    draws: [...state.draws, card],
                }));

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
export type { GameState, GameActions };
