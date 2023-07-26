"use client";

import { DeltaEvent } from "@/types/event";
import { Chips } from "@navikt/ds-react";
import EventList from "./eventList";
import { useEffect, useState } from "react";
import { getEvents } from "@/service/eventActions";

export default function EventFilters() {
  const [onlyFuture, setOnlyFuture] = useState(true);
  const [onlyJoined, setOnlyJoined] = useState(false);

  const [events, setEvents] = useState([] as DeltaEvent[]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getEvents({ onlyFuture, onlyJoined })
      .then(setEvents)
      .then(() => setLoading(false));
  }, [onlyFuture, onlyJoined]);

  return (
    <div className="flex flex-col gap-6 w-full justify-center items-center">
      <Chips defaultValue="all" className="w-full">
        <Chips.Toggle
          selected={onlyFuture}
          onClick={() => setOnlyFuture((x) => !x)}
        >
          Fremtidige
        </Chips.Toggle>
        <Chips.Toggle
          selected={onlyJoined}
          onClick={() => setOnlyJoined((x) => !x)}
        >
          Påmeldte
        </Chips.Toggle>
      </Chips>
      <div className="w-full p-4">
        <EventList events={events} loading={loading} />
      </div>
    </div>
  );
}
