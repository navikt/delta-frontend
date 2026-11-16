"use client";

import { createContext, useContext, useState, useTransition } from "react";

type OverviewTransitionValue = {
  pending: boolean;
  startTransition: ReturnType<typeof useTransition>[1];
  /** Number of events in the "Alle" tab, reported by the results once known. */
  allCount: number | null;
  setAllCount: (count: number) => void;
};

const TransitionContext = createContext<OverviewTransitionValue | null>(null);

export function OverviewTransition({ children }: { children: React.ReactNode }) {
  const [pending, startTransition] = useTransition();
  const [allCount, setAllCount] = useState<number | null>(null);
  return <TransitionContext.Provider value={{ pending, startTransition, allCount, setAllCount }}>
    {children}
  </TransitionContext.Provider>;
}

export function useOverviewTransition() {
  const value = useContext(TransitionContext);
  if (!value) throw new Error("OverviewTransition is required");
  return value;
}

/** For results that are also rendered outside the home overview, e.g. on category pages. */
export function useOptionalOverviewTransition() {
  return useContext(TransitionContext);
}
