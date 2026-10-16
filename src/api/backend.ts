import "server-only";
import { getDeltaBackendAccessToken } from "@/auth/token";
import { backendUrl } from "./backendConfig";
import { requestBackend } from "./backendTransport";

export { BackendError } from "./backendTransport";

// Validates the caller and exchanges the OBO token (both deduplicated per request).
export async function backendFetch(
  path: string,
  init?: Parameters<typeof requestBackend>[0]["init"],
): Promise<Response> {
  return requestBackend({
    baseUrl: backendUrl(),
    accessToken: await getDeltaBackendAccessToken(),
    path,
    init,
  });
}
