"use client";

import CardWithBackground from "@/components/cardWithBackground";
import { ProgressBar } from "@navikt/ds-react";

export default function Loading() {
  return (
    <CardWithBackground title="Delta">
      <div className="flex flex-col items-center justify-center py-20 space-y-4 w-full max-w-xl mx-auto">
        <div className="w-3/4">
          <ProgressBar
            size="large"
            simulated={{ seconds: 15, onTimeout: () => { } }}
            aria-label="Laster statistikk"
          />
        </div>
        <p className="text-lg">Laster statistikk, dette tar ca. 10 sekunder...</p>
      </div>
    </CardWithBackground>
  );
}
