"use client";

import { ReadFailure } from "@/components/resultsBoundary";

export default function ErrorPage(props: { error: Error & { digest?: string }; retry: () => void }) {
  return <ReadFailure {...props} />;
}
