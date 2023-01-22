import { IGameState } from "../api/endpoints/game";
import { GameState, initialState } from "./game";

const mapToRemote = (state: GameState): IGameState => {
    // TODO: Implement

    return {
        id: state.id as number,
        token: state.token as string,
        shuffle_indices: state.shuffleIndices,
        official: !state.offline,
        cards: [],
        players: [],
        sips_per_beer: 14,
        has_ended: false,
        description_html: "",
        location: {
            latitude: 0,
            longitude: 0,
            accuracy: 0,
        },
        start_datetime: new Date(state.gameStartTimestamp).toISOString(),
        end_datetime: undefined,
        description: "",
        dnf: false,
        image: undefined,
    };
};

const mapToLocal = (state: IGameState): GameState => {
    // TODO: Implement

    return {
        ...initialState,
        id: state.id,
        token: state.token,
        gameStartTimestamp: Date.parse(state.start_datetime),
        shuffleIndices: state.shuffle_indices,
        offline: !state.official,
    };
};

export { mapToRemote, mapToLocal };
