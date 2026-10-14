"use client";

import { useSyncExternalStore } from "react";

const subscribe = () => () => {};
const browserReady = () => true;
const serverReady = () => false;

export function useBrowserNow() {
  const ready = useSyncExternalStore(subscribe, browserReady, serverReady);
  return ready ? Date.now() : null;
}
