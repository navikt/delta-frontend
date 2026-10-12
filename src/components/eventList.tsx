"use client";
import { FullDeltaEvent } from "@/types/event";
import { EventCard } from "@/components/eventCard";
import { Skeleton } from "@navikt/ds-react";

type EventListProps = {
  fullEvents: FullDeltaEvent[];
  loading: boolean;
  showAll?: string[];
  tabname?: string;
  userEmail?: string;
  showOnlyRegistered?: boolean;
};
export default function EventList({
  fullEvents,
  loading,
  showAll,
  tabname,
  userEmail,
  showOnlyRegistered,
}: EventListProps) {
  return (
    <div className="grid grid-cols-1 ax-md:grid-cols-3 gap-4">
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
            event={fullEvent}
            showAll={showAll}
            tabname={tabname}
            categories={fullEvent.categories}
            userEmail={userEmail}
            showOnlyRegistered={showOnlyRegistered}
            key={`event-${fullEvent.event.id}`}
          />
        ))
      ) : (
        <p className="col-span-full italic text-ax-xlarge">
          Fant ingen arrangementer :--(
        </p>
      )}
    </div>
  );
}
