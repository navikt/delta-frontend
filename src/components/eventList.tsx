"use client";

import { DeltaEvent } from "@/types/event";
import { EventCard } from "@/components/eventCard";

type EventListProps = { events: DeltaEvent[] };
export default function EventList({ events }: EventListProps) {
  return (
    <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {events.map((event) => (
        <EventCard event={event} key={`event-${event.id}`} />
      ))}
    </section>
  );
}
