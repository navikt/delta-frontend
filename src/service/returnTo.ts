const RETURN_TO_ORIGIN = "https://delta.local";

/**
 * Validates an untrusted `returnTo` value and returns a safe, same-origin
 * relative path, or `fallback` when the value is missing or points elsewhere.
 *
 * A leading-slash check alone is not enough: the WHATWG URL parser strips tabs
 * and newlines and treats backslashes as slashes, so values such as
 * `/\attacker.example` or `/\t/attacker.example` resolve to a foreign origin
 * once rendered into a link. We therefore resolve the value against a sentinel
 * origin and only accept it when the parsed origin is unchanged.
 */
export function safeReturnTo(returnTo: string | string[] | undefined, fallback: string): string {
  const value = Array.isArray(returnTo) ? returnTo[0] : returnTo;
  if (!value || typeof value !== "string" || !value.startsWith("/") || value.startsWith("//")) {
    return fallback;
  }
  try {
    const url = new URL(value, RETURN_TO_ORIGIN);
    if (url.origin !== RETURN_TO_ORIGIN) {
      return fallback;
    }
    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return fallback;
  }
}
