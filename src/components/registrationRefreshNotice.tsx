"use client";

import { useState, useTransition } from "react";
import { Button, LocalAlert } from "@navikt/ds-react";
import { refreshEventRegistration } from "@/service/waitlistActions";
import type { getEventRegistrationState } from "@/service/eventInteractiveReads";

export default function RegistrationRefreshNotice({ eventId, onUpdated }: {
  eventId: string;
  onUpdated: (state: Awaited<ReturnType<typeof getEventRegistrationState>>) => void;
}) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState("");

  return <LocalAlert status="warning" size="small" role="status">
    <LocalAlert.Content className="flex flex-col gap-2">
      <p>Endringen er lagret, men vi kunne ikke hente oppdatert påmeldingsstatus.</p>
      {error && <p role="alert">{error}</p>}
      <Button variant="secondary" loading={pending} onClick={() => startTransition(async () => {
        const result = await refreshEventRegistration(eventId);
        if (!result.ok) {
          setError(result.message);
          return;
        }
        onUpdated(result.data);
      })}>Oppdater status</Button>
    </LocalAlert.Content>
  </LocalAlert>;
}
