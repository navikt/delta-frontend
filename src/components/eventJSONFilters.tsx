"use client";

import { Category, FullDeltaEvent } from "@/types/event";
import { Search, Tabs, UNSAFE_Combobox } from "@navikt/ds-react";
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
  const [selectedCategories, setSelectedCategories] = useState(allCategories);
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
  }, [selectedCategories, onlyFuture, onlyPast, onlyJoined, onlyMine]);

  useEffect(() => {
    const filtered = events.filter((fullEvent) =>
        fullEvent.event.title.toLowerCase().includes(searchInput.toLowerCase()),
    );
    setFilterEvents(filtered);
  }, [events, searchInput]);

  return (
      <div className="flex flex-col w-full gap-6 items-start">
        <pre>
          {JSON.stringify(
              filterEvents.map(({event, ...rest}) => ({
                ...rest,
                event: {
                  ...event,
                  participants: undefined,
                },
              })),
              null,
              2
          )}
        </pre>
      </div>
  );
}