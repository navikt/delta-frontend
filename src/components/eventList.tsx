"use client";

import { FullDeltaEvent } from "@/types/event";
import { EventCard } from "@/components/eventCard";
import { Skeleton } from "@navikt/ds-react";

type EventListProps = {
  fullEvents: FullDeltaEvent[];
  loading: boolean;
};
export default function EventList({ fullEvents, loading }: EventListProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {loading ? (
        <>
          <Skeleton variant="rounded" />
          <Skeleton variant="rounded" />
          <Skeleton variant="rounded" />
          <Skeleton variant="rounded" />
        </>
      ) : fullEvents.length ? (
        fullEvents.map((fullEvent) => (
          <EventCard
            event={fullEvent.event}
            categories={fullEvent.categories}
            key={`event-${fullEvent.event.id}`}
          />
        ))
      ) : (
        <p className="text-center col-span-full italic text-xlarge">
          Fant ingen arrangementer :--(
        </p>
      )}
    </div>
  );
}
