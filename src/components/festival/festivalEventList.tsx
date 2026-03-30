"use client";
import { FestivalEventCard } from "./festivalEventCard";
import { FullDeltaEvent } from "@/types/event";
import { Skeleton } from "@navikt/ds-react";

type FestivalEventListProps = {
  filteredEvents: FullDeltaEvent[];
  loading: boolean;
  basePath: string;
  hiddenCategoryNames: string[];
};

export default function FestivalEventList({
  filteredEvents,
  loading,
  basePath,
  hiddenCategoryNames,
}: FestivalEventListProps) {
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
    return (
      <p className="col-span-full italic text-ax-xlarge">
        Fant ingen arrangementer :--(
      </p>
    );
  }

  return (
    <div className="grid grid-cols-1 ax-md:grid-cols-3 gap-4">
      {filteredEvents.map((fullEvent) => (
        <FestivalEventCard
          event={fullEvent}
          basePath={basePath}
          hiddenCategoryNames={hiddenCategoryNames}
          key={`event-${fullEvent.event.id}`}
        />
      ))}
    </div>
  );
}
