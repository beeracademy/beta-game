import client from "../client";

export interface IPostStartRequest {
    tokens: string[];
    official: boolean;
}

export async function postStart(tokens: string[], official: boolean): Promise<IGameState> {
    const data: IPostStartRequest = {
        tokens: tokens,
        official: official,
    };

    return (await client.post("/api/games/", data)).data;
}

export interface IGameState {
    id: number;
    start_datetime: string;
    end_datetime?: string;
    description: string;
    official: boolean;
    dnf: boolean;
    shuffle_indices: number[];
    cards: ICard[];
    players: IPlayer[];
    sips_per_beer: number;
    has_ended: boolean;
    description_html: string;
    location: ILocation;
    image?: string;
    token: string;
}

export interface IPlayer {
    id: number;
    username: string;
    is_superuser: boolean;
    image_url: string;
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

export interface IResumableGame {
    id: number;
    start_datetime: string;
    players: {
        id: number;
        username: string;
        image: string;
    }[];
}

export async function getResumableGames(token: string): Promise<IResumableGame[]> {
    const response = await client.get<IResumableGame[]>("/api/games/resumable/", {
        headers: {
            Authorization: `Token ${token}`,
        },
    });

    return response.data;
}

export async function postResumeGame(token: string, gameId: number): Promise<IGameState> {
    const response = await client.post(
        `/api/games/${gameId}/resume/`,
        {},
        {
            headers: {
                Authorization: `Token ${token}`,
            },
        }
    );

    return response.data;
}
