import { safeReturnTo } from "../service/returnTo.ts";

const KEY_PREFIX = "event-overview-return:";
const HISTORY_STATE_KEY = "__deltaOverviewReturn";

type StoredReturn = { path: string; entryId: string; claimed?: boolean };
export type OverviewReturn = { kind: "back" } | { kind: "push"; path: string };

export function overviewReturnKey(detailPath: string) {
  return `${KEY_PREFIX}${detailPath}`;
}

function parseStoredReturn(stored: string | null): StoredReturn | null {
  if (!stored) return null;
  try {
    const parsed: unknown = JSON.parse(stored);
    if (!parsed || typeof parsed !== "object") return null;
    const { path, entryId, claimed } = parsed as Partial<StoredReturn>;
    const safePath = safeReturnTo(typeof path === "string" ? path : undefined, "");
    if (!safePath || typeof entryId !== "string" || !entryId) return null;
    return { path: safePath, entryId, claimed: claimed === true };
  } catch {
    return null;
  }
}

/**
 * Claims a pending card click for the detail history entry it opened. Returns the updated
 * stored value and the marker to write into that entry's history state, or null when the
 * click was already claimed (the entry was reached some other way) or the entry is marked.
 */
export function claimOverviewReturn(stored: string | null, currentMarker: unknown) {
  const parsed = parseStoredReturn(stored);
  if (!parsed || parsed.claimed || currentMarker !== undefined) return null;
  return {
    stored: JSON.stringify({ ...parsed, claimed: true } satisfies StoredReturn),
    marker: parsed.entryId,
  };
}

/**
 * Decides how the detail page's back link returns to the overview the user came from.
 * `back` is only used when the current history entry carries the marker written for the card
 * click, so the previous entry is known to be that overview. Otherwise the stored overview path
 * is pushed so filters and scroll position still match.
 */
export function resolveOverviewReturn(stored: string | null, currentMarker: unknown): OverviewReturn | null {
  const parsed = parseStoredReturn(stored);
  if (!parsed) return null;
  if (parsed.claimed && currentMarker === parsed.entryId) return { kind: "back" };
  return { kind: "push", path: parsed.path };
}

function currentHistoryMarker(): unknown {
  return (window.history.state as Record<string, unknown> | null)?.[HISTORY_STATE_KEY];
}

/** Call from an overview card click before navigating to `detailHref`. */
export function rememberOverviewReturn(detailHref: string, overviewPath: string) {
  const detailPath = new URL(detailHref, window.location.origin).pathname;
  const entryId = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
  sessionStorage.setItem(
    overviewReturnKey(detailPath),
    JSON.stringify({ path: overviewPath, entryId } satisfies StoredReturn),
  );
}

export function claimCurrentOverviewReturn() {
  const key = overviewReturnKey(window.location.pathname);
  const claim = claimOverviewReturn(sessionStorage.getItem(key), currentHistoryMarker());
  if (!claim) return;
  sessionStorage.setItem(key, claim.stored);
  // Spreading the current state keeps Next.js' `__NA` flag, so its patched replaceState passes
  // this straight through without treating it as a navigation.
  window.history.replaceState({ ...window.history.state, [HISTORY_STATE_KEY]: claim.marker }, "");
}

export function readOverviewReturn(): OverviewReturn | null {
  return resolveOverviewReturn(
    sessionStorage.getItem(overviewReturnKey(window.location.pathname)),
    currentHistoryMarker(),
  );
}
