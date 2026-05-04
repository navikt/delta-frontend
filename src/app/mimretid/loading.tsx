"use client";

import { ProgressBar } from "@navikt/ds-react";

export default function MimretidLoading() {
  return (
    <div
      className="w-full flex-grow flex flex-col items-center justify-center py-20 min-h-screen -mb-8"
      style={{ background: "linear-gradient(135deg, #312e81, #6b21a8, #312e81)" }}
    >
      <div className="w-full max-w-md px-6 text-center">
        <h1 className="text-3xl font-ax-bold text-white mb-2">Henter mimretid...</h1>
        <p className="text-xl text-white/90 mb-8">Samler arrangementene dine for valgt år.</p>

        <div className="bg-white rounded-xl p-6 shadow-lg">
          <ProgressBar size="large" simulated={{ seconds: 12, onTimeout: () => {} }} aria-label="Laster mimretid" />
        </div>
      </div>
    </div>
  );
}
