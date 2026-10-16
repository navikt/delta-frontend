type Env = Record<string, string | undefined>;

export function backendUrl(env: Env = process.env) {
  return env.NODE_ENV === "production"
    ? "http://delta-backend"
    : "http://localhost:8080";
}

export function backendScope(env: Env = process.env) {
  const cluster = env.NEXT_PUBLIC_CLUSTER === "prod" ? "prod-gcp" : "dev-gcp";
  return `api://${cluster}.delta.delta-backend/.default`;
}
