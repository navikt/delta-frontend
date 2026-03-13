"use client";
import { EventCard } from "@/components/mim/cards/eventCard";
import { FullDeltaEvent } from "@/types/event";
import { Skeleton } from "@navikt/ds-react";

type EventListProps = {
  filteredEvents: FullDeltaEvent[];
  loading: boolean;
};

export default function EventList({ filteredEvents, loading }: EventListProps) {
  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton variant="rounded" />
        <Skeleton variant="rounded" />
        <Skeleton variant="rounded" />
        <Skeleton variant="rounded" />
      </div>
    );
  }

  if (!filteredEvents || filteredEvents?.length === 0) {
    return <p className="col-span-full italic text-ax-xlarge">Fant ingen arrangementer :--(</p>;
  }

  return (
    <div className="grid grid-cols-1 ax-md:grid-cols-3 gap-4">
      {filteredEvents.map((fullEvent) => (
        <EventCard event={fullEvent} key={`event-${fullEvent.event.id}`} />
      ))}
    </div>
  );
}
