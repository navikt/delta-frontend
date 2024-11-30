'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'

interface UmamiContextType {
    trackView: (url: string) => void
    trackEvent: (eventName: string, eventData?: any) => void
}

const UmamiContext = createContext<UmamiContextType | undefined>(undefined)

export const UmamiContextProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isLoaded, setIsLoaded] = useState(false)
    const pathname = usePathname()
    const searchParams = useSearchParams()

    useEffect(() => {
        if (typeof window !== 'undefined' && !isLoaded) {
            const script = document.createElement('script')
            script.async = true
            script.src = 'https://cdn.nav.no/team-researchops/sporing/sporing.js'
            script.setAttribute('data-website-id', 'efe951d8-ebbb-4fad-938e-91eee190f6aa')
            script.setAttribute('data-host-url', 'https://umami.nav.no')
            script.setAttribute('data-domains', 'delta.nav.no')
            script.onload = () => setIsLoaded(true)
            document.body.appendChild(script)
        }
    }, [isLoaded])

    useEffect(() => {
        // @ts-ignore
        if (isLoaded && window.umami) {
            // @ts-ignore
            window.umami.trackView(pathname + (searchParams.toString() ? `?${searchParams.toString()}` : ''))
        }
    }, [isLoaded, pathname, searchParams])

    const trackView = (url: string) => {
        // @ts-ignore
        if (window.umami) {
            // @ts-ignore
            window.umami.trackView(url)
        }
    }

    const trackEvent = (eventName: string, eventData?: any) => {
        // @ts-ignore
        if (window.umami) {
            // @ts-ignore
            window.umami.trackEvent(eventName, eventData)
        }
    }

    return (
        <UmamiContext.Provider value={{ trackView, trackEvent }}>
            {children}
        </UmamiContext.Provider>
    )
}

export const useUmami = () => {
    const context = useContext(UmamiContext)
    if (context === undefined) {
        throw new Error('useUmami must be used within a UmamiContextProvider')
    }
    return context
}

