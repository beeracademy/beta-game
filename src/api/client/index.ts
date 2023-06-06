import axios from "axios";
import AxiosMockAdapter from "axios-mock-adapter";
import * as AxiosLogger from "axios-logger";
import { TokenInteceptor } from "../inteceptors/token";

const mockInstance = axios.create();

mockInstance.interceptors.request.use((request) => {
  return AxiosLogger.requestLogger(request, {
    prefixText: "Mocked",
    dateFormat: "HH:MM:ss",
    headers: false,
    data: false,
  });
});

const realInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
});

TokenInteceptor(realInstance);

export const mock = new AxiosMockAdapter(mockInstance, {
  delayResponse: 200,
});

// if (env.MOCKED) {
//     console.info("Using mocked axios client");
// }

// export default env.MOCKED ? mockInstance : realInstance;

export default realInstance;
