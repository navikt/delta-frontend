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
  categories: allCategories = [],
  selectTime = false,
  selectCategory = false,
  onlyJoined = false,
  onlyMine = false,
}: {
  categories?: Category[];
  selectTime?: boolean;
  selectCategory?: boolean;
  onlyJoined?: boolean;
  onlyMine?: boolean;
}) {
  const [selectedCategories, setSelectedCategories] = useState<Category[]>([]);

  const [selectedTime, setSelectedTime] = useState(TimeSelector.FUTURE);
  const onlyFuture = selectedTime === TimeSelector.FUTURE;
  const onlyPast = selectedTime === TimeSelector.PAST;

  const [events, setEvents] = useState([] as FullDeltaEvent[]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getEvents({
      categories: selectedCategories,
      onlyFuture,
      onlyPast,
      onlyJoined,
      onlyMine,
    })
      .then(setEvents)
      .then(() => setLoading(false));
  }, [selectedCategories, onlyFuture, onlyPast, onlyJoined]);

  return (
    <div className="flex flex-col w-full gap-6 items-start">
      {selectTime && (
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
      )}
      {selectCategory && (
        <div className="flex justify-between items-center flex-wrap gap-2">
          <span className="flex gap-2 items-center">
            <FunnelIcon />
            <label className="font-bold">Filtrer på kategori</label>
          </span>
          <UNSAFE_Combobox
            className="w-fit"
            size="small"
            label="Filtrer på kategori"
            hideLabel
            options={allCategories.map((category) => category.name)}
            selectedOptions={selectedCategories.map(
              (category) => category.name,
            )}
            onToggleSelected={(categoryName, isSelected) => {
              if (isSelected) {
                setSelectedCategories((categories) => [
                  ...categories,
                  allCategories.find(
                    (category) => category.name === categoryName,
                  )!,
                ]);
              } else {
                setSelectedCategories((categories) =>
                  categories.filter(
                    (category) => category.name !== categoryName,
                  ),
                );
              }
            }}
            isMultiSelect
            shouldAutocomplete
          />
        </div>
      )}
      <div className="w-full p-4">
        <EventList fullEvents={events} loading={loading} />
      </div>
    </div>
  );
}
