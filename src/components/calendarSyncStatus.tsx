"use client";

import { CheckmarkCircleIcon, ClockIcon, ExclamationmarkTriangleIcon } from "@navikt/aksel-icons";
import { BodyShort, Button } from "@navikt/ds-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { retryCalendarSync } from "@/service/eventActions";
import { CalendarSyncStatus as CalendarSyncState } from "@/types/event";
import { OrganizerStatus, OrganizerStatusRow } from "@/components/organizerStatusBox";

type CalendarSyncStatusProps = {
  eventId: string;
  status?: CalendarSyncState | null;
  error?: string | null;
  isHost: boolean;
};

/** Calendar sync row for the organizer status box. */
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

  if (status === "SYNCED") {
    return (
      <OrganizerStatusRow
        label="Kalender"
        status={<OrganizerStatus tone="success" icon={<CheckmarkCircleIcon aria-hidden />}>Oppdatert</OrganizerStatus>}
      />
    );
  }

  if (status === "PENDING") {
    return (
      <OrganizerStatusRow
        label="Kalender"
        status={<OrganizerStatus tone="neutral" icon={<ClockIcon aria-hidden />}>Oppdateres …</OrganizerStatus>}
      />
    );
  }

  return (
    <OrganizerStatusRow
      label="Kalender"
      status={<OrganizerStatus tone="danger" icon={<ExclamationmarkTriangleIcon aria-hidden />}>Ikke oppdatert</OrganizerStatus>}
    >
      <BodyShort size="small">{error || "Outlook-kalenderen kunne ikke oppdateres."}</BodyShort>
      <Button
        type="button"
        size="small"
        variant="secondary"
        className="w-fit"
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
      {actionError && (
        <BodyShort size="small" textColor="default" data-color="danger" role="alert">
          {actionError}
        </BodyShort>
      )}
    </OrganizerStatusRow>
  );
}
