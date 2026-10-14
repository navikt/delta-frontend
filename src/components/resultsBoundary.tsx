"use client";

import { BodyShort, Button, LocalAlert } from "@navikt/ds-react";
import { catchError, type ErrorInfo } from "next/error";

export function ReadFailure({ retry, error }: { retry: () => void; error: Error & { digest?: string } }) {
  return (
    <LocalAlert status="error" className="w-full p-4">
      <LocalAlert.Header>
        <LocalAlert.Title>Kunne ikke laste inn dataene</LocalAlert.Title>
      </LocalAlert.Header>
      <LocalAlert.Content>
        <BodyShort className="pb-4">Prøv igjen.</BodyShort>
        {error.digest && <BodyShort className="pb-4">Feilreferanse: {error.digest}</BodyShort>}
        <Button variant="secondary" size="small" onClick={() => retry()}>Prøv igjen</Button>
      </LocalAlert.Content>
    </LocalAlert>
  );
}

export default catchError(function ResultsFailure(_props: { title?: string }, { error, retry }: ErrorInfo) {
  return <ReadFailure error={error instanceof Error ? error : new Error()} retry={retry} />;
});
