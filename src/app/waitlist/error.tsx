"use client";

import { ReadFailure } from "@/components/resultsBoundary";

export default function WaitlistError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <ReadFailure error={error} retry={reset} />;
}
