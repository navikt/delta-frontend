import { getDeltaBackendAccessToken } from "@/auth/token";
import axios from "axios";

export async function getApi() {
  const accessToken = await getDeltaBackendAccessToken();
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };
  if (accessToken !== null) {
    headers.Authorization = `Bearer ${accessToken}`;
  }

  const client = axios.create({
    baseURL: backendUrl(),
    timeout: 15000,
    headers,
  });
  client.interceptors.response.use(
    (response) => response,
    (error) => {
      const status = error.response?.status;
      delete error.config;
      delete error.response;
      delete error.request;
      if (status !== undefined) {
        error.status = status;
      }
      return Promise.reject(error);
    },
  );
  return client;
}

export function backendUrl() {
  return process.env.NODE_ENV === "production"
    ? "http://delta-backend"
    : "http://localhost:8080";
}
