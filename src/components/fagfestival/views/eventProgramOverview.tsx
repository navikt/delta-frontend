"use client";
import React from "react";
import { FullDeltaEvent } from "@/types/event";
import { Skeleton } from "@navikt/ds-react";
import { EventCard } from "@/components/fagfestival/cards/eventCard";

type EventProgramOverviewProps = {
  filteredEvents: FullDeltaEvent[];
  loading: boolean;
};

const generateTimeSlots = (events: FullDeltaEvent[]): string[] => {
  const times = new Set<string>();
  events.forEach((event) => {
    const startTime = new Date(event.event.startTime);
    const formattedTime = startTime.getHours().toString().padStart(2, "0") + ":00";
    times.add(formattedTime);
  });
  return Array.from(times).sort();
};

export default function EventProgramOverview({
  filteredEvents,
  loading,
}: EventProgramOverviewProps) {
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
  
  const days = Array.from(
    new Set(
      filteredEvents.map((event) => {
        const eventDate = new Date(event.event.startTime);
        return eventDate.toISOString().split("T")[0];
      }),
    ),
  );

  const timeSlots = generateTimeSlots(filteredEvents);

  return (
    <table className="w-full h-full table-fixed">
      <thead>
        <tr>
          <th className="w-12 ax-md:w-14 ax-lg:w-16"></th>
          {days.map((day) => (
            <th key={day}>{new Date(day).toLocaleDateString()}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {timeSlots.map((time, idx) => (
          <tr key={idx}>
            <td className="align-top pt-4">{time}</td>
            {days.map((day) => (
              <td key={`${time}-${day}`}>
                <div className="flex flex-col h-full p-0">
                  {filteredEvents
                    .filter((event) => {
                      const eventStartTime = new Date(event.event.startTime);
                      const eventDay = eventStartTime.toISOString().split("T")[0];
                      const eventHour =
                        eventStartTime.getHours().toString().padStart(2, "0") + ":00";
                      return eventDay === day && eventHour === time;
                    })
                    .map((event) => (
                      <div
                        key={event.event.id}
                        className="h-full flex-1 flex flex-col p-1"
                        title={`${event.event.title} - ${event.event.description}`}
                      >
                        <EventCard event={event} key={`event-${event.event.id}`} />
                      </div>
                    ))}
                </div>
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
