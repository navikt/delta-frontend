"use client";

import { ReadFailure } from "@/components/resultsBoundary";

export default function ErrorPage({ error, unstable_retry }: { error: Error & { digest?: string }; unstable_retry: () => void }) {
  return <ReadFailure error={error} retry={unstable_retry} />;
}
