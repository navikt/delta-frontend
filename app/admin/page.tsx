import { getDeltaBackendAccessToken } from "@/auth/token";
import { backendUrl } from "@/toggles/utils";

export default async function Events() {
  const accessToken = await getDeltaBackendAccessToken();

  const headers: HeadersInit = {};
  if (accessToken !== null) {
    headers.Authorization = `Bearer ${accessToken}`;
  }
  const response = await fetch(`${backendUrl()}/admin/event`, {
    headers,
    next: { revalidate: 0 },
  });

  const response_forReal: any = await response.text();

  return <pre>{response_forReal}</pre>;
}
