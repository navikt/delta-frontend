"use client"; // Mark this file as a Client Component

import React, { createContext, useEffect, ReactNode } from "react";

// Define the context type (if needed, keep it empty if not used yet)
interface UmamiContextProps {}

// Create the context
export const UmamiContext = createContext<UmamiContextProps | null>(null);

interface UmamiProviderProps {
    children: ReactNode;
}

export const UmamiContextProvider: React.FC<UmamiProviderProps> = ({ children }) => {
    useEffect(() => {
        // Helper function to load a script
        const loadScript = (src: string, attributes: Record<string, string>) => {
            return new Promise<void>((resolve, reject) => {
                const script = document.createElement("script");
                script.src = src;
                script.defer = true;

                // Set additional attributes
                Object.entries(attributes).forEach(([key, value]) => {
                    script.setAttribute(key, value);
                });

                script.onload = () => resolve();
                script.onerror = () => reject(new Error(`Failed to load script: ${src}`));

                document.body.appendChild(script);
            });
        };

        // Load both scripts sequentially
        const loadScripts = async () => {
            try {
                await loadScript("https://cdn.nav.no/team-researchops/sporing/sporing.js", {
                    "data-domains": "delta.nav.no",
                    "data-host-url": "https://umami.nav.no",
                    "data-website-id": "efe951d8-ebbb-4fad-938e-91eee190f6aa",
                });

                await loadScript("https://cdn.nav.no/team-researchops/ping/v1/ping.js", {
                    "data-ping-endpoint": "https://ping.nav.no/event",
                    "data-ping-team": "delta",
                    "data-ping-app": "delta-frontend",
                    "data-ping-environment": "prod",
                    "data-ping-track-pageviews": "true",
                });
            } catch (error) {
                console.error(error);
            }
        };

        loadScripts();

        return () => {
            // Cleanup scripts when the component unmounts
            const scripts = document.querySelectorAll(
                'script[src="https://cdn.nav.no/team-researchops/sporing/sporing.js"], script[src="https://cdn.nav.no/team-researchops/ping/v1/ping.js"]'
            );
            scripts.forEach((script) => document.body.removeChild(script));
        };
    }, []);

    return (
        <UmamiContext.Provider value={{}}>
            {children}
        </UmamiContext.Provider>
    );
};
