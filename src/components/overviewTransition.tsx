"use client";

import { createContext, useContext, useEffect, useState, useTransition, type Dispatch, type SetStateAction } from "react";

const LOADING_MESSAGE = "Laster arrangementer …";

type OverviewTransitionValue = {
  pending: boolean;
  startTransition: ReturnType<typeof useTransition>[1];
  /** Number of events in the "Alle" tab, reported by the results once known. */
  allCount: number | null;
  setAllCount: (count: number) => void;
  availableCategoryNames: string[] | null;
  setAvailableCategoryNames: Dispatch<SetStateAction<string[] | null>>;
  setResultsMessage: (message: string) => void;
};

const TransitionContext = createContext<OverviewTransitionValue | null>(null);

export function OverviewTransition({ children }: { children: React.ReactNode }) {
  const [pending, startTransition] = useTransition();
  const [allCount, setAllCount] = useState<number | null>(null);
  const [availableCategoryNames, setAvailableCategoryNames] = useState<string[] | null>(null);
  const [resultsMessage, setResultsMessage] = useState("");
  // Results remount under a new Suspense key when filters change, so the live region lives here.
  return <TransitionContext.Provider value={{
    pending, startTransition, allCount, setAllCount, availableCategoryNames, setAvailableCategoryNames, setResultsMessage,
  }}>
    <p role="status" className="sr-only">{pending ? LOADING_MESSAGE : resultsMessage}</p>
    {children}
  </TransitionContext.Provider>;
}

export function useOverviewTransition() {
  const value = useContext(TransitionContext);
  if (!value) throw new Error("OverviewTransition is required");
  return value;
}

/** Announces a results summary through the provider's live region, or a local one outside the provider. */
export function ResultsStatus({ message }: { message: string }) {
  const setResultsMessage = useContext(TransitionContext)?.setResultsMessage;
  useEffect(() => { setResultsMessage?.(message); }, [message, setResultsMessage]);
  if (setResultsMessage) return null;
  return <p role="status" className="sr-only">{message}</p>;
}

export function resultsStatusMessage(ready: boolean, count: number) {
  if (!ready) return LOADING_MESSAGE;
  return count === 1 ? "Viser 1 arrangement" : `Viser ${count} arrangementer`;
}

/** For results that are also rendered outside the home overview, e.g. on category pages. */
export function useOptionalOverviewTransition() {
  return useContext(TransitionContext);
}
