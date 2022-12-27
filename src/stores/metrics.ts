import create from "zustand";
import useGame from "./game";

interface PlayerMetrics {
    totalSips: number;
    maxSips: number;
    minSips: number;
    totalTime: number;
    cumulativeSips: number[];
    numberOfBeers: number;

    // Only updated in the beginning of a new round
    isLeading: boolean;
    isLast: boolean;
}

interface MetricsState {
    playerMetrics: PlayerMetrics[];
}

interface MetricsActions {
    Update(): void;
}

const initialState: MetricsState = {
    playerMetrics: [],
};

const useMetrics = create<MetricsState & MetricsActions>()((set, get) => ({
    ...initialState,

    Update: () => {
        console.debug("[Metrics]", "updating");

        const game = useGame.getState();
        const currentPlayerMetrics = get().playerMetrics;
        const currentPlayerIndex = game.cards.length % game.players.length;

        // Find the cumulative sips for each player
        const cumulativeSips = game.cards.reduce<number[][]>(
            (acc, card, index) => {
                const playerIndex = index % game.players.length;

                acc[playerIndex].push((acc[playerIndex][acc[playerIndex].length - 1] || 0) + card.value);

                return acc;
            },
            Array.from({ length: game.players.length }, () => [0])
        );

        // Find the total sips for each player
        const totalSips = cumulativeSips.map((cumulativeSips) => cumulativeSips[cumulativeSips.length - 1]);

        // Find number of beers for each player
        const numberOfBeers = totalSips.map((totalSips) => Math.floor(totalSips / game.sipsInABeer));

        // Find the leading player
        const leadingPlayerIndex = totalSips.indexOf(Math.max(...totalSips));

        // Find the last player
        const lastPlayerIndex = totalSips.indexOf(Math.min(...totalSips));

        // Update the state
        const playerMetrics: PlayerMetrics[] = game.players.map((_, index) => ({
            ...currentPlayerMetrics[index],

            totalSips: totalSips[index],
            cumulativeSips: cumulativeSips[index],
            maxSips: 0,
            minSips: 0,
            totalTime: 0,
            numberOfBeers: numberOfBeers[index],

            // Only updated in the beginning of a new round, or first time calculating metrics
            ...((currentPlayerIndex === 0 || currentPlayerMetrics.length === 0) &&
                game.cardCount !== 0 && {
                    isLeading: index === leadingPlayerIndex,
                    isLast: index === lastPlayerIndex,
                }),
        }));

        set({
            playerMetrics: playerMetrics,
        });
    },
}));

useGame.subscribe(() => {
    useMetrics.getState().Update();
});
useMetrics.getState().Update();

const usePlayerMetrics = (playerIndex: number) => {
    return (
        useMetrics((state) => state.playerMetrics[playerIndex]) || {
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

export { useMetrics, usePlayerMetrics };
export type { MetricsState, MetricsActions };
