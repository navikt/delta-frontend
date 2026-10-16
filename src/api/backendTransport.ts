export const BACKEND_TIMEOUT_MS = 15000;

export class BackendError extends Error {
  status?: number;
  responseMessage?: string;
  constructor(status?: number, responseMessage?: string) {
    super(
      status === undefined
        ? "Kunne ikke koble til Delta. Prøv igjen."
        : `Delta svarte med status ${status}.`,
    );
    this.name = "BackendError";
    this.status = status;
    this.responseMessage = responseMessage;
  }
}

type RequestOptions = {
  baseUrl: string;
  accessToken: string | null;
  path: string;
  init?: Omit<RequestInit, "headers"> & { headers?: Record<string, string> };
  fetchImpl?: typeof fetch;
};

async function safeMessage(response: Response) {
  const text = await response.text().catch(() => "");
  if (!text) return undefined;
  try {
    const data = JSON.parse(text);
    const message = data?.error ?? data?.message;
    return typeof message === "string" ? message.slice(0, 500) : undefined;
  } catch {
    return text.slice(0, 500);
  }
}

// Returns only successful responses; failures become BackendError without headers, URL or token.
export async function requestBackend({
  baseUrl,
  accessToken,
  path,
  init = {},
  fetchImpl = fetch,
}: RequestOptions): Promise<Response> {
  const headers: Record<string, string> = { ...init.headers };
  if (init.body !== undefined) headers["Content-Type"] ??= "application/json";
  if (accessToken !== null) headers.Authorization = `Bearer ${accessToken}`;

  let response: Response;
  try {
    response = await fetchImpl(`${baseUrl}${path}`, {
      cache: "no-store",
      signal: AbortSignal.timeout(BACKEND_TIMEOUT_MS),
      ...init,
      headers,
    });
  } catch {
    throw new BackendError();
  }
  if (!response.ok) {
    throw new BackendError(response.status, await safeMessage(response));
  }
  return response;
}
