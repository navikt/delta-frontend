"use client";

import { Alert, Button, Detail, Tag } from "@navikt/ds-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { retryCalendarSync } from "@/service/eventActions";
import { CalendarSyncStatus as CalendarSyncState } from "@/types/event";

type CalendarSyncStatusProps = {
  eventId: string;
  status?: CalendarSyncState | null;
  error?: string | null;
  isHost: boolean;
};

export default function CalendarSyncStatus({
  eventId,
  status: initialStatus,
  error: initialError,
  isHost,
}: CalendarSyncStatusProps) {
  const router = useRouter();
  const [status, setStatus] = useState(initialStatus);
  const [error, setError] = useState(initialError);
  const [actionError, setActionError] = useState<string | null>(null);
  const [retrying, setRetrying] = useState(false);

  useEffect(() => {
    setStatus(initialStatus);
    setError(initialError);
  }, [initialError, initialStatus]);

  useEffect(() => {
    if (!isHost || status !== "PENDING") return;
    const interval = setInterval(() => router.refresh(), 5000);
    return () => clearInterval(interval);
  }, [isHost, router, status]);

  if (!isHost || !status) return null;

  return (
    <div className="flex flex-col items-start gap-1">
      <Detail>Bare synlig for arrangører</Detail>
      {status === "SYNCED" ? (
        <Tag variant="moderate" data-color="success" size="small">Kalenderen er oppdatert</Tag>
      ) : status === "PENDING" ? (
        <Alert variant="info" size="small">
          Outlook-kalenderen oppdateres. Det kan ta litt tid før endringene vises.
        </Alert>
      ) : (
        <Alert variant="error" size="small">
          <div className="flex flex-col items-start gap-2">
            <span>{error || "Outlook-kalenderen kunne ikke oppdateres."}</span>
            <Button
              type="button"
              size="small"
              variant="secondary"
              loading={retrying}
              onClick={async () => {
                setRetrying(true);
                setActionError(null);
                const result = await retryCalendarSync(eventId);
                if (result.ok) {
                  setStatus(result.data.event.calendarSyncStatus);
                  setError(result.data.calendarSyncError ?? null);
                } else {
                  setActionError(result.message);
                }
                setRetrying(false);
              }}
            >
              Prøv synkronisering på nytt
            </Button>
            {actionError && <span role="alert">{actionError}</span>}
          </div>
        </Alert>
      )}
    </div>
  );
}
