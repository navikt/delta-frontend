"use client";

import { ProgressBar } from "@navikt/ds-react";

export default function WrappedLoading() {
    return (
        <div
            className="w-full flex-grow flex flex-col items-center justify-center py-20 min-h-[60vh]"
            style={{ background: 'linear-gradient(135deg, #312e81, #6b21a8, #312e81)' }}
        >
            <div className="w-full max-w-md px-6 text-center">
                <h1 className="text-3xl font-bold text-white mb-2">
                    Klargjør din oppsummering...
                </h1>
                <p className="text-xl text-white/90 mb-8">
                    Vent litt mens vi henter statistikken din ✨
                </p>

                <div className="bg-white rounded-xl p-6 shadow-lg">
                    <ProgressBar
                        size="large"
                        simulated={{ seconds: 5, onTimeout: () => { } }}
                        aria-label="Laster statistikk"
                    />
                </div>
            </div>
        </div>
    );
}
