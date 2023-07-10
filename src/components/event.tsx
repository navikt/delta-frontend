"use client";

import { DeltaEvent } from "@/types/event";
import { CalendarIcon } from "@navikt/aksel-icons";
import { formatEventTimes } from "./format";
import { BodyLong, Detail, Heading } from "@navikt/ds-react";

type EventProps = { event: DeltaEvent };

export function Event({ event }: EventProps) {
  return (
    <main className="flex flex-grow">
      <section className="w-screen flex justify-center items-center flex-col">
        <Heading level="1" size="large">
          {event.title}
        </Heading>
        <Detail className="flex gap-1 items-center">
          <CalendarIcon /> {formatEventTimes(event)}
        </Detail>
        <BodyLong className="flex gap-1 items-center">
          {event.description}
        </BodyLong>
      </section>
    </main>
  );
}
