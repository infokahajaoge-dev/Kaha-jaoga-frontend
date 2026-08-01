import axios, {
  type AxiosError,
  type AxiosInstance,
  type InternalAxiosRequestConfig,
} from "axios";
import { getToken, removeToken } from "@/src/utils/token";
import { emitUnauthorized } from "@/src/utils/authEvents";

const DEFAULT_TIMEOUT_MS = 30_000;

function createApiClient(): AxiosInstance {
  const client = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL,
    timeout: DEFAULT_TIMEOUT_MS,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
  });

  client.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
      const token = getToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error: AxiosError) => Promise.reject(error)
  );

  client.interceptors.response.use(
    (response) => response,
    (error: AxiosError) => {
      if (error.response?.status === 401) {
        removeToken();
        emitUnauthorized();
      }
      return Promise.reject(error);
    }
  );

  return client;
}

/** Shared Axios instance — pages must not import axios directly. */
export const apiClient = createApiClient();
