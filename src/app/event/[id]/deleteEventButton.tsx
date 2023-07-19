"use client";
import { Button } from "@navikt/ds-react";
import { deleteEvent } from "./eventActions";
import { DeltaEvent } from "@/types/event";
import Link from "next/link";
import { TrashIcon } from "@navikt/aksel-icons";

export function DeleteEventButton({ event }: { event: DeltaEvent }) {
  return (
    <Button
      type="submit"
      variant="danger"
      className="w-fit h-fit font-bold"
      onClick={async () => deleteAndRedirect(event.id)}
    >
      <span className="flex items-center gap-1">
        <TrashIcon /> Slett
      </span>
    </Button>
  );
}

export function EditEventButton({ event }: { event: DeltaEvent }) {
  return (
    <Link
      className="w-fit h-fit navds-button navds-button--primary navds-label"
      href={`/event/${event.id}/edit`}
    >
      Rediger arrangement
    </Link>
  );
}

async function deleteAndRedirect(eventId: string) {
  await deleteEvent(eventId);
  window.location.href = "/";
}
