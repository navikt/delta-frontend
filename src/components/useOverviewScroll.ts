"use client";

import { useEffect, useRef } from "react";

export function useOverviewScroll(path: string, ready: boolean) {
  const restored = useRef<string | null>(null);
  useEffect(() => {
    if (!ready || restored.current === path) return;
    const key = `event-overview-scroll:${path}`;
    const saved = sessionStorage.getItem(key);
    if (saved === null) {
      restored.current = path;
      return;
    }
    const y = Number(saved);
    if (!Number.isFinite(y) || y < 0) {
      sessionStorage.removeItem(key);
      restored.current = path;
      return;
    }
    let secondFrame = 0;
    const firstFrame = requestAnimationFrame(() => {
      secondFrame = requestAnimationFrame(() => {
        window.scrollTo({ top: y, behavior: "auto" });
        sessionStorage.removeItem(key);
        restored.current = path;
      });
    });
    return () => {
      cancelAnimationFrame(firstFrame);
      cancelAnimationFrame(secondFrame);
    };
  }, [path, ready]);
}
