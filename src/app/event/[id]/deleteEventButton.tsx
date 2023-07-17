"use client";
import { Button } from "@navikt/ds-react";
import { deleteEvent } from "./eventActions";
import { DeltaEvent } from "@/types/event";

export default function DeleteEventButton({ event }: { event: DeltaEvent }) {
  return (
    <form action={deleteAndRedirect} className="w-full max-w-[12rem] h-full">
      <input type="hidden" name="id" value={event.id} />
      <Button type="submit" variant="danger" className="w-full h-fit font-bold">
        SLETT ARRANGEMENT
      </Button>
    </form>
  );
}

async function deleteAndRedirect(formData: FormData) {
  await deleteEvent(formData);
  window.location.href = "/";
}
