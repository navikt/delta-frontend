"use client";

import { Category, FullDeltaEvent } from "@/types/event";
import { Search, Tabs, UNSAFE_Combobox } from "@navikt/ds-react";
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
  searchName = false,
  onlyJoined = false,
  onlyMine = false,
}: {
  categories?: Category[];
  selectTime?: boolean;
  searchName?: boolean;
  selectCategory?: boolean;
  onlyJoined?: boolean;
  onlyMine?: boolean;
}) {
  const [selectedCategories, setSelectedCategories] = useState<Category[]>([]);
  const [searchInput, setSearchInput] = useState("");
  const [filterEvents, setFilterEvents] = useState<FullDeltaEvent[]>([]);

  const [selectedTime, setSelectedTime] = useState(TimeSelector.FUTURE);
  const onlyFuture = selectedTime === TimeSelector.FUTURE;
  const onlyPast = selectedTime === TimeSelector.PAST;

  const [events, setEvents] = useState([] as FullDeltaEvent[]);
  const [loading, setLoading] = useState(true);

  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

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

  useEffect(() => {
    const filtered = events.filter((fullEvent) =>
      fullEvent.event.title.toLowerCase().includes(searchInput.toLowerCase()),
    );
    setFilterEvents(filtered);
  }, [events, searchInput]);

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
      {(searchName || selectCategory) && (
        <div className="flex flex-col-reverse gap-2 items-start md:flex-row justify-between w-full md:items-center px-4">
          {searchName && (
            <Search
              label="Søk alle kommende arrangementer"
              variant="simple"
              value={searchInput}
              size="small"
              className="border-[#000] w-full md:w-auto"
              onChange={(e) => {
                setSearchInput(e);
              }}
            />
          )}
          {selectCategory && (
            <div className="w-full md:w-fit flex items-center flex-wrap flex-row-reverse md:flex-row gap-2">
              <span className="gap-2 items-center hidden md:flex">
                <FunnelIcon title="trakt" />
                <label className="font-bold">Filtrer på kategori</label>
              </span>
              <UNSAFE_Combobox
                className="w-full md:w-fit"
                size="small"
                label="Filtrer på kategori"
                hideLabel={!isMobile}
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
        </div>
      )}
      <div className="w-full p-4">
        <EventList fullEvents={filterEvents} loading={loading} />
      </div>
    </div>
  );
}
