import client from "../client";

export interface RankedCardResponse {
  user_id: number;
  user_username: string;
  user_image: string;
  ranking_name: string;
  ranking_value: string;
}

export async function getRankedCards(): Promise<RankedCardResponse[]> {
  const response = await client.get<RankedCardResponse[]>("/api/ranked_cards/");
  return response.data;
}

export interface UserStatsResponse {
  season_number: number;
  total_games: number;
  total_time_played_seconds: number;
  total_sips: number;
  best_game: number | null;
  worst_game: number | null;
  best_game_sips: number | null;
  worst_game_sips: number | null;
  total_chugs: number;
  fastest_chug: number | null;
  fastest_chug_duration_ms?: number | null;
  average_chug_time_seconds: number | null;
}

// API returns one entry per season, plus a season_number: 0 entry aggregating all-time totals
export async function getUserStats(
  userId: number,
): Promise<UserStatsResponse[]> {
  const response = await client.get<UserStatsResponse[]>(
    `/api/stats/${userId}/`,
  );
  return response.data;
}
