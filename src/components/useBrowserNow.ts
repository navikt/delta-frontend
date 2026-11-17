"use client";

import { useSyncExternalStore } from "react";

let now: number | null = null;
let interval: ReturnType<typeof setInterval> | undefined;
const listeners = new Set<() => void>();

function updateNow() {
  now = Date.now();
  for (const listener of listeners) listener();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  if (listeners.size === 1) {
    updateNow();
    interval = setInterval(updateNow, 30_000);
    window.addEventListener("focus", updateNow);
  }
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0) {
      clearInterval(interval);
      window.removeEventListener("focus", updateNow);
    }
  };
}

const browserNow = () => now;
const serverNow = () => null;

export function useBrowserNow() {
  return useSyncExternalStore(subscribe, browserNow, serverNow);
}
