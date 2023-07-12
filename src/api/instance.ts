import { getDeltaBackendAccessToken } from "@/auth/token";
import axios from "axios";

export function getAuthlessApi() {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };

  return axios.create({
    baseURL: backendUrl(),
    timeout: 1000,
    headers,
  });
}

export async function getAuthApi() {
  const accessToken = await getDeltaBackendAccessToken();
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };
  if (accessToken !== null) {
    headers.Authorization = `Bearer ${accessToken}`;
  }

  return axios.create({
    baseURL: backendUrl(),
    timeout: 1000,
    headers,
  });
}

function backendUrl() {
  return process.env.NODE_ENV === "production"
    ? "http://delta-backend"
    : "http://localhost:8080";
}
