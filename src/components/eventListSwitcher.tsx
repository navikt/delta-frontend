"use client";

import { DeltaEvent } from "@/types/event";
import { Chips } from "@navikt/ds-react";
import EventList from "./eventList";
import { useEffect, useState } from "react";
import { getEvents } from "@/service/eventActions";

export default function EventListSwitcher() {
  const [onlyFuture, setOnlyFuture] = useState(true);
  const [onlyMine, setOnlyMine] = useState(false);
  const [onlyJoined, setOnlyJoined] = useState(false);

  const [events, setEvents] = useState([] as DeltaEvent[]);

  useEffect(() => {
    getEvents(onlyFuture, onlyMine, onlyJoined).then(setEvents);
  }, [onlyFuture, onlyMine, onlyJoined]);

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
          selected={onlyMine}
          onClick={() => setOnlyMine((x) => !x)}
        >
          Mine
        </Chips.Toggle>
        <Chips.Toggle
          selected={onlyJoined}
          onClick={() => setOnlyJoined((x) => !x)}
        >
          Påmeldte
        </Chips.Toggle>
        <div className="w-full p-4">
          <EventList events={events} />
        </div>
      </Chips>
    </div>
  );
}
