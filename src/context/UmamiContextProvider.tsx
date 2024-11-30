'use client';

import React, { createContext, useContext, useEffect } from 'react';
import Script from 'next/script';
import { usePathname } from 'next/navigation';

// Define the context type
type UmamiContextType = {
    track: (eventName: string, properties?: Record<string, any>) => void;
};

// Create the context with a default empty implementation
const UmamiContext = createContext<UmamiContextType>({
    track: () => {},
});

// Provider component
export const UmamiContextProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const pathname = usePathname();

    useEffect(() => {
        // Track initial page load
        // @ts-ignore
        if (window.umami) {
            // @ts-ignore
            window.umami.track(pathname);
        }
    }, [pathname]);

    const track = (eventName: string, properties?: Record<string, any>) => {
        // @ts-ignore
        if (window.umami) {
            // @ts-ignore
            window.umami.track(eventName, properties);
        }
    };

    return (
        <UmamiContext.Provider value={{ track }}>
            <Script
                strategy="afterInteractive"
                src="https://cdn.nav.no/team-researchops/sporing/sporing.js"
                data-domains="delta.nav.no"
                data-host-url="https://umami.nav.no"
                data-website-id="efe951d8-ebbb-4fad-938e-91eee190f6aa"
                defer
            />
            {children}
        </UmamiContext.Provider>
    );
};

// Custom hook to use Umami analytics
export const useUmami = () => useContext(UmamiContext);