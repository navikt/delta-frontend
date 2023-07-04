'use client'

import { InternalHeader } from "@navikt/ds-react"

export default function Header() {
    return <InternalHeader className='flex justify-between flex-grow-0'>
        <InternalHeader.Title as="h1" className='whitespace-nowrap'>
            Delta Δ
        </InternalHeader.Title>
        <InternalHeader.User name="Ola Nordmann" />
    </InternalHeader>
} 