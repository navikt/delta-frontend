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
    timeout: 1000,
    headers,
  });
  client.interceptors.response.use(
    (response) => response,
    (error) => {
      console.log(JSON.stringify(error, null, 2));
      return Promise.reject(error);
    },
  );
  return client;
}

function backendUrl() {
  return process.env.NODE_ENV === "production"
    ? "http://delta-backend"
    : "http://localhost:8080";
}
