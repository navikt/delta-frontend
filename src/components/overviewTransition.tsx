"use client";

import { createContext, useContext, useTransition } from "react";

const TransitionContext = createContext<{
  pending: boolean; startTransition: ReturnType<typeof useTransition>[1];
} | null>(null);

export function OverviewTransition({ children }: { children: React.ReactNode }) {
  const [pending, startTransition] = useTransition();
  return <TransitionContext.Provider value={{ pending, startTransition }}>{children}</TransitionContext.Provider>;
}

export function useOverviewTransition() {
  const value = useContext(TransitionContext);
  if (!value) throw new Error("OverviewTransition is required");
  return value;
}
