import create from "zustand";
import { persist } from "zustand/middleware";
import { Card, CardSuit, CardValue } from "../models/card";
import { Player } from "../models/player";
import useGamesPlayed from "./gamesPlayed";
import { useMetrics } from "./metrics";

interface GameState {
    cards: Card[];
    players: Player[];

    roundCount: number;
    totalRoundCount: number;

    cardCount: number;
    totalCardCount: number;

    playerCount: number;
    activePlayerIndex: number;

    gameStartTimestamp: number;
    turnStartTimestamp: number;

    sipsInABeer: number;

    done: boolean;
}

interface GameActions {
    StartGame: (players: Player[]) => void;
    DrawCard: () => Card;
    ExitGame: () => void;
}

const initialState: GameState = {
    gameStartTimestamp: 0,
    turnStartTimestamp: 0,

    cards: [],
    players: [],

    sipsInABeer: 14,

    roundCount: 1,
    totalRoundCount: 13,

    cardCount: 0,
    totalCardCount: 0,

    playerCount: 0,
    activePlayerIndex: 0,

    done: false,
};

const useGame = create<GameState & GameActions>()(
    persist(
        (set) => ({
            ...initialState,

            StartGame: (players: Player[]) => {
                console.debug("[Game]", "Starting game");

                set({
                    players: players,
                    playerCount: players.length,
                    gameStartTimestamp: Date.now(),
                    turnStartTimestamp: Date.now(),
                    totalCardCount: players.length * 13,
                });

                useGamesPlayed.getState().incrementStarted();
            },

            DrawCard: () => {
                console.debug("[Game]", "Drawing card");

                const card: Card = {
                    value: (Math.floor(Math.random() * 13) + 2) as CardValue,
                    suit: ["S", "C", "H", "D", "A", "I"][Math.floor(Math.random() * 6)] as CardSuit,
                };

                set((state) => {
                    const isDone = state.cards.length + 1 >= state.playerCount * state.totalRoundCount;
                    if (isDone) {
                        useGamesPlayed.getState().incrementCompleted();
                    }

                    return {
                        cards: [...state.cards, card],
                        cardCount: state.cards.length + 1,
                        roundCount: Math.floor((state.cards.length + 1) / state.playerCount) + 1,
                        activePlayerIndex: (state.cards.length + 1) % state.playerCount,
                        totalCardCount: state.playerCount * 13,
                        turnStartTimestamp: Date.now(),
                        done: isDone,
                    };
                });

                return card;
            },

            ExitGame: () => {
                console.debug("[Game]", "Exiting game");

                set(initialState);
            },
        }),
        {
            name: "game",
        }
    )
);

export default useGame;
export type { GameState, GameActions };
