import client from "../client";
import { Game } from "../models/game";

export interface PostStartRequest {
  tokens: string[];
  official: boolean;
}

export async function postStart(
  tokens: string[],
  official: boolean,
): Promise<Game> {
  const data: PostStartRequest = {
    tokens: tokens,
    official: official,
  };

  return (await client.post("/api/games/", data)).data;
}

export async function postUpdate(
  token: string,
  gameState: Game,
): Promise<void> {
  return await client.post(
    `/api/games/${gameState.id}/update_state/`,
    gameState,
    {
      headers: {
        Authorization: `GameToken ${token}`,
      },
    },
  );
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

export interface ResumableGame {
  id: number;
  start_datetime: string;
  players: {
    id: number;
    username: string;
    image: string;
  }[];
}

export async function getResumableGames(
  token: string,
): Promise<ResumableGame[]> {
  const response = await client.get<ResumableGame[]>("/api/games/resumable/", {
    headers: {
      Authorization: `Token ${token}`,
    },
  });

  return response.data;
}

export async function postResumeGame(
  token: string,
  gameId: number,
): Promise<Game> {
  const response = await client.post(
    `/api/games/${gameId}/resume/`,
    {},
    {
      headers: {
        Authorization: `Token ${token}`,
      },
    },
  );

  return response.data;
}
