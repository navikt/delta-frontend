'use client'

import { Button } from '@navikt/ds-react'
import { useState } from 'react';

export default function Home() {
  let [success, setSuccess] = useState(false);
  const kafkaCall = () => {
    fetch('api/kafka')
    .then((res) => {
      setSuccess(res.status === 200);
    })
  }
  return (
    <main>
      {success && <h1>Success!</h1>}
      <Button onClick={kafkaCall}>
        trykk her!
      </Button>
    </main>
  )
}
