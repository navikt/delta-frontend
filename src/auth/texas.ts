/**
 * Low-level Texas (Token Exchange as a Service) HTTP helpers.
 * Texas runs as a sidecar and exposes endpoints via environment variables.
 * These functions accept token strings directly and work in any context
 * (RSC via headers(), API routes via request.headers).
 */

export async function exchangeForOboToken(
  userToken: string,
  target: string,
): Promise<string | null> {
  const endpoint = process.env.NAIS_TOKEN_EXCHANGE_ENDPOINT;
  if (!endpoint) {
    console.error("NAIS_TOKEN_EXCHANGE_ENDPOINT is not set");
    return null;
  }

  const res = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ identity_provider: "entra_id", target, user_token: userToken }),
  });

  if (!res.ok) {
    console.error("Token exchange failed:", res.status);
    return null;
  }

  const data = await res.json();
  return data.access_token ?? null;
}

export async function introspectToken(
  token: string,
): Promise<Record<string, unknown> | null> {
  const endpoint = process.env.NAIS_TOKEN_INTROSPECTION_ENDPOINT;
  if (!endpoint) {
    console.error("NAIS_TOKEN_INTROSPECTION_ENDPOINT is not set");
    return null;
  }

  const res = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ identity_provider: "entra_id", token }),
  });

  if (!res.ok) {
    console.error("Token introspection failed:", res.status);
    return null;
  }

  const data = await res.json();
  return data.active ? data : null;
}
