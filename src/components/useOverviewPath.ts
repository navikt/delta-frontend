"use client";

import { useSyncExternalStore } from "react";
import { usePathname, useSearchParams } from "next/navigation";

function subscribe(onChange: () => void) {
  window.addEventListener("popstate", onChange);
  return () => window.removeEventListener("popstate", onChange);
}

function browserPath() {
  return `${window.location.pathname}${window.location.search}`;
}

export function useOverviewPath() {
  const pathname = usePathname();
  const params = useSearchParams().toString();
  const serverPath = `${pathname}${params ? `?${params}` : ""}`;
  // URLSearchParams normalizes spaces and commas; storage/return links need the exact shallow URL.
  return useSyncExternalStore(subscribe, browserPath, () => serverPath);
}
