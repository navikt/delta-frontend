export function backendUrl() {
  return process.env.NODE_ENV === "production"
    ? "http://delta-backend"
    : "http://localhost:8080";
}
