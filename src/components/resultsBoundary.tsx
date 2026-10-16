"use client";

import { BodyShort, Button, LocalAlert } from "@navikt/ds-react";
import { catchError, type ErrorInfo } from "next/error";

export function ReadFailure({ retry, error }: { retry: () => void; error: Error & { digest?: string } }) {
  return (
    <LocalAlert status="error" className="w-full p-4">
      <LocalAlert.Header>
        <LocalAlert.Title>Fikk ikke kontakt med Delta</LocalAlert.Title>
      </LocalAlert.Header>
      <LocalAlert.Content>
        <BodyShort className="pb-4">Det oppstod en kommunikasjonsfeil. Prøv igjen om litt.</BodyShort>
        {error.digest && <BodyShort className="pb-4">Feilreferanse: {error.digest}</BodyShort>}
        <Button variant="secondary" size="small" onClick={() => retry()}>Prøv igjen</Button>
      </LocalAlert.Content>
    </LocalAlert>
  );
}

export default catchError(function ResultsFailure(_props: { title?: string }, { error, retry }: ErrorInfo) {
  return <ReadFailure error={error instanceof Error ? error : new Error()} retry={retry} />;
});
