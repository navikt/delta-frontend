"use client";

import { ProgressBar } from "@navikt/ds-react";

export default function SimulatedProgressBar({
  seconds,
  label,
}: {
  seconds: number;
  label: string;
}) {
  return (
    <ProgressBar
      size="large"
      simulated={{ seconds, onTimeout: () => {} }}
      aria-label={label}
    />
  );
}
