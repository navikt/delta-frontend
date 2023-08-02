"use client";

import { Category, DeltaEvent, FullDeltaEvent } from "@/types/event";
import { Chips, Tabs, UNSAFE_Combobox } from "@navikt/ds-react";
import EventList from "./eventList";
import { useEffect, useState } from "react";
import { getEvents } from "@/service/eventActions";
import { FunnelIcon } from "@navikt/aksel-icons";

enum TimeSelector {
  PAST,
  FUTURE,
}

export default function EventFilters({
  categories,
}: {
  categories: Category[];
}) {
  const [onlyJoined, setOnlyJoined] = useState(false);
  const [selectedTime, setSelectedTime] = useState(TimeSelector.FUTURE);
  const onlyFuture = selectedTime === TimeSelector.FUTURE;
  const onlyPast = selectedTime === TimeSelector.PAST;

  const [events, setEvents] = useState([] as FullDeltaEvent[]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getEvents({ onlyFuture, onlyPast, onlyJoined })
      .then(setEvents)
      .then(() => setLoading(false));
  }, [onlyFuture, onlyPast, onlyJoined]);

  return (
    <div className="flex flex-col gap-6 w-full justify-center items-center">
      <Tabs className="self-start w-full" defaultValue="fremtidige">
        <Tabs.List>
          <Tabs.Tab
            value="fremtidige"
            label="Fremtidige"
            onClick={() => setSelectedTime(TimeSelector.FUTURE)}
          />
          <Tabs.Tab
            value="tidligere"
            label="Tidligere"
            onClick={() => setSelectedTime(TimeSelector.PAST)}
          />
        </Tabs.List>
      </Tabs>
      <div className="flex justify-between w-full">
        <div>
          <Chips defaultValue="all" className="w-full">
            <Chips.Toggle
              selected={onlyJoined}
              onClick={() => setOnlyJoined((x) => !x)}
            >
              Påmeldte
            </Chips.Toggle>
          </Chips>
        </div>
        <div className="flex gap-2 items-center">
          <FunnelIcon />
          <UNSAFE_Combobox
            className="w-fit"
            size="small"
            label="Filtrer"
            hideLabel
            options={categories.map((category) => category.name)}
            isMultiSelect
            shouldAutocomplete
          />
        </div>
      </div>
      <div className="w-full p-4">
        <EventList fullEvents={events} loading={loading} />
      </div>
    </div>
  );
}
