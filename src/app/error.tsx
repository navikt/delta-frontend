"use client";

import { ReadFailure } from "@/components/resultsBoundary";

export default function ErrorPage({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  return <ReadFailure error={error} retry={retry} />;
}
