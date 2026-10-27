import { safeReturnTo } from "../service/returnTo.ts";

const KEY_PREFIX = "event-overview-return:";

type StoredReturn = { path: string; historyLength?: number };
export type OverviewReturn = { kind: "back" } | { kind: "push"; path: string };

export function overviewReturnKey(detailPath: string) {
  return `${KEY_PREFIX}${detailPath}`;
}

function parseStoredReturn(stored: string | null): StoredReturn | null {
  if (!stored) return null;
  try {
    const parsed: unknown = JSON.parse(stored);
    if (!parsed || typeof parsed !== "object") return null;
    const { path, historyLength } = parsed as Partial<StoredReturn>;
    const safePath = safeReturnTo(typeof path === "string" ? path : undefined, "");
    if (!safePath) return null;
    return typeof historyLength === "number" ? { path: safePath, historyLength } : { path: safePath };
  } catch {
    return null;
  }
}

/** Records the history length of the detail entry the first time it is shown after a card click. */
export function claimOverviewReturn(stored: string | null, historyLength: number): string | null {
  const parsed = parseStoredReturn(stored);
  if (!parsed || parsed.historyLength !== undefined) return null;
  return JSON.stringify({ path: parsed.path, historyLength } satisfies StoredReturn);
}

/**
 * Decides how the detail page's back link returns to the overview the user came from.
 * `back` is only safe while the detail entry is still the one opened from the overview card;
 * otherwise the stored overview path is pushed so filters and scroll position still match.
 */
export function resolveOverviewReturn(stored: string | null, historyLength: number): OverviewReturn | null {
  const parsed = parseStoredReturn(stored);
  if (!parsed) return null;
  if (parsed.historyLength === historyLength) return { kind: "back" };
  return { kind: "push", path: parsed.path };
}

/** Call from an overview card click before navigating to `detailHref`. */
export function rememberOverviewReturn(detailHref: string, overviewPath: string) {
  const detailPath = new URL(detailHref, window.location.origin).pathname;
  sessionStorage.setItem(overviewReturnKey(detailPath), JSON.stringify({ path: overviewPath } satisfies StoredReturn));
}

export function claimCurrentOverviewReturn() {
  const key = overviewReturnKey(window.location.pathname);
  const claimed = claimOverviewReturn(sessionStorage.getItem(key), window.history.length);
  if (claimed) sessionStorage.setItem(key, claimed);
}

export function readOverviewReturn(): OverviewReturn | null {
  return resolveOverviewReturn(
    sessionStorage.getItem(overviewReturnKey(window.location.pathname)),
    window.history.length,
  );
}
