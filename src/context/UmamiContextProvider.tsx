import React, { createContext, useEffect, ReactNode } from "react";

// Define the context type if needed (can be empty if not used)
interface UmamiContextProps {}

// Create the context
export const UmamiContext = createContext<UmamiContextProps | null>(null);

interface UmamiProviderProps {
    children: ReactNode;
}

export const UmamiProvider: React.FC<UmamiProviderProps> = ({ children }) => {
    useEffect(() => {
        // Dynamically create and append the script
        const script = document.createElement("script");
        script.src = "https://cdn.nav.no/team-researchops/sporing/sporing.js";
        script.setAttribute("data-domains", "delta.nav.no");
        script.setAttribute("data-host-url", "https://umami.nav.no");
        script.setAttribute("data-website-id", "efe951d8-ebbb-4fad-938e-91eee190f6aa");
        script.defer = true;

        document.body.appendChild(script);

        return () => {
            // Cleanup script when component unmounts
            document.body.removeChild(script);
        };
    }, []);

    return (
        <UmamiContext.Provider value={{}}>
            {children}
        </UmamiContext.Provider>
    );
};
