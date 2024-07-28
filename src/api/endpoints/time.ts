import client from "../client";

export interface getServerInfoResponse {
  datetime: string;
}

export async function getServerInfo(): Promise<getServerInfoResponse> {
  const response = await client.get<getServerInfoResponse>(`/api/info`);
  return response.data;
}
