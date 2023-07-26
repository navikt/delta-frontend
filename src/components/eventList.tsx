"use client";

import { DeltaEvent } from "@/types/event";
import { EventCard } from "@/components/eventCard";
import { Skeleton } from "@navikt/ds-react";

type EventListProps = { events: DeltaEvent[]; loading: boolean };
export default function EventList({ events, loading }: EventListProps) {
  return (
    <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {loading ? (
        <>
          <Skeleton variant="rounded" />
          <Skeleton variant="rounded" />
          <Skeleton variant="rounded" />
          <Skeleton variant="rounded" />
        </>
      ) : events.length ? (
        events.map((event) => (
          <EventCard event={event} key={`event-${event.id}`} />
        ))
      ) : (
        <p className="text-center col-span-full italic text-xlarge">
          Fant ingen arrangementer :--(
        </p>
      )}
    </section>
  );
}
