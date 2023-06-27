'use client'

import { InternalHeader } from '@navikt/ds-react'
import './globals.css'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="no">
      <head>
        <title>Delta Δ</title>
        <meta name='description' content='Påmeldingsapp'/>
      </head>
      <body className='min-h-screen flex flex-col'>
        <InternalHeader className='flex justify-between flex-grow-0'>
          <InternalHeader.Title as="h1" className='whitespace-nowrap'>
            Delta Δ
          </InternalHeader.Title>
          <InternalHeader.User name="Ola Nordmann"/>
        </InternalHeader>
        {children}
      </body>
    </html>
  )
}
