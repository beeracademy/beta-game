import { IGameState } from "../api/endpoints/game";
import { GameState, initialState } from "./game";

const mapToRemote = (state: GameState): IGameState => {
    // TODO: Implement

    return {
        id: state.id as number,
        token: state.token as string,
        start_datetime: new Date(state.gameStartTimestamp).toISOString(),
        shuffle_indices: state.shuffleIndices,
        official: !state.offline,
        cards: [],
        dnf: false,
        dnf_player_ids: [],
        has_ended: false,
        player_ids: [],
        player_names: [],
        description: "",
        location: {
            accuracy: 0,
            latitude: 0,
            longitude: 0,
        },
    };
};

const mapToLocal = (state: IGameState): GameState => {
    // TODO: Implement

    return {
        ...initialState,
        id: state.id,
        token: state.token,
        gameStartTimestamp: Date.parse(state.start_datetime),
        turnStartTimestamp: Date.parse(state.start_datetime),
        shuffleIndices: state.shuffle_indices,
        offline: !state.official,
    };
};

export { mapToRemote, mapToLocal };
