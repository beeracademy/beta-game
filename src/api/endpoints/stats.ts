import client from "../client";

export interface IRankedCardResponse {
  user_id: number;
  user_username: string;
  user_image: string;
  ranking_name: string;
  ranking_value: string;
}

export async function getRankedCards(): Promise<IRankedCardResponse[]> {
  const response =
    await client.get<IRankedCardResponse[]>("/api/ranked_cards/");
  return response.data;
}

export interface IUserStatsResponse {
  season_number: number;
  total_games: number;
  total_time_played_seconds: number;
  total_sips: number;
  best_game: number;
  worst_game: number;
  best_game_sips: number;
  worst_game_sips: number;
  total_chugs: number;
  fastest_chug: number;
  fastest_chug_duration_ms: number;
  average_chug_time_seconds: number;
}

export async function getUserStats(
  userId: number,
): Promise<IUserStatsResponse> {
  const response = await client.get<IUserStatsResponse>(
    `/api/stats/${userId}/`,
  );
  return response.data;
}
