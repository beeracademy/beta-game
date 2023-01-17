import client from "../client";

export interface IPostStartRequest {
    tokens: string[];
    official: boolean;
}

export async function postStart(tokens: string[], official: boolean): Promise<void> {
    const data: IPostStartRequest = {
        tokens: tokens,
        official: official,
    };

    await client.post("/api/games/", data);
}

export interface IGameState {
    state_datetime: string;
    official: boolean;
    player_names: string[];
    cards: ICard[];
    has_ended: boolean;
    description?: string;
    dnf: boolean;
    dnf_player_ids: number[];
    id: number;
    player_ids: number[];
    token: string;
    shuffle_indices: number[];
    location?: ILocation;
}

export interface ILocation {
    latitude: number;
    longitude: number;
    accuracy: number;
}

export interface ICard {
    value: number;
    suit: string;
    start_delta_ms?: number;
    chug_start_start_delta_ms?: number;
    chug_end_start_delta_ms?: number;
}

export async function postUpdate(gameState: IGameState): Promise<void> {
    return await client.post(`/api/games/${gameState.id}/update_state/`, gameState);
}

export async function addPhoto(gameId: number, imageBlob: Blob): Promise<void> {
    const formData = new FormData();
    formData.append("image", imageBlob);

    return await client.post(`/api/games/${gameId}/update_image/`, formData, {
        headers: {
            "Content-Type": "multipart/form-data",
        },
    });
}

export async function deletePhoto(gameId: number): Promise<void> {
    return await client.delete(`/api/games/${gameId}/delete_image/`);
}
