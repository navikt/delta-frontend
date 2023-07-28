"use client";

import { DeltaEvent } from "@/types/event";
import { Chips } from "@navikt/ds-react";
import EventList from "./eventList";
import { useEffect, useState } from "react";
import { getEvents } from "@/service/eventActions";

enum TimeSelector {
  ALL,
  PAST,
  FUTURE,
}

export default function EventFilters() {
  const [onlyJoined, setOnlyJoined] = useState(false);
  const [selectedTime, setSelectedTime] = useState(TimeSelector.FUTURE);
  const onlyFuture = selectedTime === TimeSelector.FUTURE;
  const onlyPast = selectedTime === TimeSelector.PAST;

  const [events, setEvents] = useState([] as DeltaEvent[]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getEvents({ onlyFuture, onlyPast, onlyJoined })
      .then(setEvents)
      .then(() => setLoading(false));
  }, [onlyFuture, onlyPast, onlyJoined]);

  return (
    <div className="flex flex-col gap-6 w-full justify-center items-center">
      <Chips defaultValue="all" className="w-full">
        <Chips.Toggle
          selected={onlyFuture}
          onClick={() =>
            onlyFuture
              ? setSelectedTime(TimeSelector.ALL)
              : setSelectedTime(TimeSelector.FUTURE)
          }
        >
          Fremtidige
        </Chips.Toggle>
        <Chips.Toggle
          selected={onlyPast}
          onClick={() =>
            onlyPast
              ? setSelectedTime(TimeSelector.ALL)
              : setSelectedTime(TimeSelector.PAST)
          }
        >
          Tidligere
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
