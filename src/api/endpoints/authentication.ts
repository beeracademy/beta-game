import client from "../client";

export interface ILoginRequest {
    username: string;
    password: string;
}

export interface ILoginResponse {
    token: string;
    id: number;
    image: string;
}

export async function login(username: string, password: string): Promise<ILoginResponse> {
    const data: ILoginRequest = {
        username: username,
        password: password,
    };

    const response = await client.post<ILoginResponse>("https://academy.beer/api-token-auth/", data, {
        headers: {
            Authorization: "", // Skip auth interceptor
        },
    });

    return response.data;
}
