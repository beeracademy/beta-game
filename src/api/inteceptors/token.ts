import { AxiosInstance } from "axios";

export function TokenInteceptor(inst: AxiosInstance) {
  inst.interceptors.request.use(
    async (request) => {
      const orgAuth = request.headers?.Authorization;
      if (orgAuth !== undefined && orgAuth === "") {
        return request;
      }

      // TODO: Get access token from somewhere
      // if (accessToken) {
      //     request.headers!.Authorization = `Bearer ${accessToken}`;
      // }

      return request;
    },
    (error) => {
      Promise.reject(error);
    }
  );
}
