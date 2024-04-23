"use client";
import { FilterOption, FullDeltaEvent } from "@/types/event";
import { EventCard } from "@/components/fagfestival/eventCard";
import { Skeleton } from "@navikt/ds-react";

type EventListProps = {
  fullEvents: FullDeltaEvent[];
  loading: boolean;
  filterOptions?: FilterOption[];
  tabname?: string;
};
export default function EventList({ fullEvents, loading, filterOptions, tabname}: EventListProps) {
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
            event={fullEvent}
            filterOptions={filterOptions}
            tabname={tabname}
            categories={fullEvent.categories}
            key={`event-${fullEvent.event.id}`}
          />
        ))
      ) : (
        <p className="col-span-full italic text-xlarge">
          Fant ingen arrangementer :--(
        </p>
      )}
    </div>
  );
}
