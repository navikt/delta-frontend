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
        // Dynamically create and append the first script
        const umamiScript = document.createElement("script");
        umamiScript.src = "https://cdn.nav.no/team-researchops/sporing/sporing.js";
        umamiScript.setAttribute("data-domains", "delta.nav.no");
        umamiScript.setAttribute("data-host-url", "https://umami.nav.no");
        umamiScript.setAttribute("data-website-id", "efe951d8-ebbb-4fad-938e-91eee190f6aa");
        umamiScript.defer = true;

        // Dynamically create and append the second script
        const pingScript = document.createElement("script");
        pingScript.src = "https://cdn.nav.no/team-researchops/ping/v1/ping.js";
        pingScript.setAttribute("data-ping-endpoint", "https://ping.nav.no/event");
        pingScript.setAttribute("data-ping-team", "delta");
        pingScript.setAttribute("data-ping-app", "delta-frontend");
        pingScript.setAttribute("data-ping-environment", "prod");
        pingScript.setAttribute("data-ping-track-pageviews", "true");
        pingScript.defer = true;

        document.body.appendChild(umamiScript);
        document.body.appendChild(pingScript);

        return () => {
            // Cleanup the scripts when the component unmounts
            document.body.removeChild(umamiScript);
            document.body.removeChild(pingScript);
        };
    }, []);

    return (
        <UmamiContext.Provider value={{}}>
            {children}
        </UmamiContext.Provider>
    );
};

