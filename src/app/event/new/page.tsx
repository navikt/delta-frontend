"use client";
import { Button, TextField } from "@navikt/ds-react";
import { createEvent } from "./createEvent";

export default function NewEvent() {
  return (
    <div>
      <form action={createEvent}>
        <TextField label="Tittel" name="title" />
        <TextField label="Beskrivelse" name="description" />
        <TextField label="Starttidspunkt" name="startTime" />
        <TextField label="Sluttidspunkt" name="endTime" />
        <Button type="submit">Lag event</Button>
      </form>
    </div>
  );
}
