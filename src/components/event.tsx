"use client";

import { DeltaEvent } from "@/types/event";
import { BodyLong, Detail, Heading } from "@navikt/ds-react/esm/typography";
import { joinEvent } from "@/app/event/[id]/joinEvent";
import { Button } from "@navikt/ds-react";
type EventProps = { event: DeltaEvent };

export function Event({ event }: EventProps) {
  return (
    <>
      <Heading level="1" size="large">
        {event.title}
      </Heading>
      <Detail className="flex gap-1 items-center">
        {event.startTime} - {event.endTime}
      </Detail>
      <BodyLong className="flex gap-1 items-center">
        {event.description}
      </BodyLong>
      <form action={joinEvent}>
        <input type="hidden" name="id" value={event.id} />
        <Button type="submit">Bli med</Button>
      </form>
    </>
  );
}
