import axios from "axios";
import AxiosMockAdapter from "axios-mock-adapter";
import * as AxiosLogger from "axios-logger";
import { TokenInterceptor } from "../interceptors/token";

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
  // Django's CSRF middleware reads the token from the "csrftoken" cookie and
  // expects it echoed back in the "X-CSRFToken" header. Axios only does this
  // automatically for its own default cookie/header names (XSRF-TOKEN /
  // X-XSRF-TOKEN), so we need to point it at Django's names explicitly.
  withCredentials: true,
  xsrfCookieName: "csrftoken",
  xsrfHeaderName: "X-CSRFToken",
});

TokenInterceptor(realInstance);

export const mock = new AxiosMockAdapter(mockInstance, {
  delayResponse: 200,
});

// if (env.MOCKED) {
//     console.info("Using mocked axios client");
// }

// export default env.MOCKED ? mockInstance : realInstance;

export default realInstance;
