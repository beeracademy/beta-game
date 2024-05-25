import client from "../client";

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  id: number;
  image: string;
}

export async function login(
  username: string,
  password: string,
): Promise<LoginResponse> {
  const data: LoginRequest = {
    username: username,
    password: password,
  };

  const response = await client.post<LoginResponse>("/api-token-auth/", data, {
    headers: {
      Authorization: "", // Skip auth interceptor
    },
  });

  return response.data;
}

export interface CreateUserResponse {
  token: string;
  id: number;
  image: string;
}

export async function createUser(
  username: string,
  password: string,
): Promise<CreateUserResponse> {
  const data: LoginRequest = {
    username: username,
    password: password,
  };

  const response = await client.post<LoginResponse>("/api/users/", data, {
    headers: {
      Authorization: "", // Skip auth interceptor
    },
  });

  return response.data;
}
