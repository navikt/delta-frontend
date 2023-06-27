'use client'

import { Button, InternalHeader } from '@navikt/ds-react'
import { useState } from 'react'

export default function Home() {
  const [clicked, setClicked] = useState(false);
  const toggleClicked = () => {
    setClicked(!clicked);
  }
  return (
    <main className="flex flex-grow">
      <section className='w-screen flex-grow flex justify-center items-center'>
        <Button variant={clicked ? "danger" : "primary"} onClick={toggleClicked}>
          trykk her!
        </Button>
      </section>
    </main>
  )
}
