"use client";

import EventList from "@/components/fagfestival/views/eventList";
import EventProgramOverview from "@/components/fagfestival/views/eventProgramOverview";
import { getEvents } from "@/service/eventActions";
import { FilterOption, FullDeltaEvent } from "@/types/event";
import { Checkbox, CheckboxGroup, Search, Tabs } from "@navikt/ds-react";
import Link from "next/link";
import React, { useEffect, useRef, useState } from "react";

const fagfestivalCategory = "#fagfestivalen";
const activeDays = ["28", "29", "30"];
const fagfestivalMonth = "April"

const getRemainingActiveDays = () => {
  const today = new Date();
  const dayOfMonth = today.getDate();
  return activeDays.filter(day => parseInt(day) >= dayOfMonth);
};

const getCurrentDayAsString = () => {
  const today = new Date();
  const dayOfMonth = today.getDate().toString();
  if (activeDays.includes(dayOfMonth)) {
    return dayOfMonth;
  } else if (parseInt(activeDays[0]) > today.getDate()) {
    return activeDays[0];
  } else {
    return "påmeldte";
  }
};

const FagfestivalEvents = () => {
  const [searchInput, setSearchInput] = useState("");
  const [filterEvents, setFilterEvents] = useState<FullDeltaEvent[]>([]);
  const [filterOptions, setFilterOptions] = useState<FilterOption[]>([]);
  const [tabName, setTabName] = useState(getCurrentDayAsString());
  const [events, setEvents] = useState([] as FullDeltaEvent[]);
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const filteredEvents = events.filter((fullEvent) => {
      let passesDayFilter = true;

      if (activeDays.includes(tabName)) {
        const startTime = new Date(fullEvent.event.startTime);
        const dayOfMonth = startTime.getDate();
        passesDayFilter = dayOfMonth.toString() === tabName;
      }

      return (
        fullEvent.event.title.toLowerCase().includes(searchInput.toLowerCase()) &&
        fullEvent.categories.some((category) => category.name === fagfestivalCategory) &&
        passesDayFilter
      );
    });
    setFilterEvents(filteredEvents);
  }, [events, searchInput, tabName]);

  useEffect(() => {
    // Load initial events
    setLoading(true);

    getEvents({
      onlyFuture: true,
    })
      .then(setEvents)
      .then(() => setLoading(false));

    // Resizing
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener("resize", handleResize);
    handleResize();

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  useEffect(() => {
    // Disables programoversikt in Mobile for "Mine Påmeldinger":
    // - No mobile compatibility when we have events for multiple days

    if (tabName === "påmeldte" && isMobile) {
      const filteredOptions = filterOptions.filter((option) => option !== "vis-programoversikt");
      setFilterOptions(filteredOptions);
    }
  }, [isMobile, tabName]);

  const prevTabNameRef = useRef<string>(undefined);

  useEffect(() => {
    const hasNoNeedToReload = () => {
      const prevTabName = prevTabNameRef.current;
      prevTabNameRef.current = tabName;

      return (
        prevTabName &&
        (prevTabName === tabName ||
          (activeDays.includes(tabName) && activeDays.includes(prevTabName)))
      );
    };

    if (hasNoNeedToReload()) {
      return;
    }

    setLoading(true);

    if (tabName === "påmeldte") {
      getEvents({
        onlyFuture: true,
        onlyJoined: true,
      })
        .then(setEvents)
        .then(() => setLoading(false));
    } else {
      getEvents({
        onlyFuture: true,
      })
        .then(setEvents)
        .then(() => setLoading(false));
    }
  }, [tabName]);

  const showProgramoversiktFilterOption = tabName !== "påmeldte" || !isMobile;

  return (
    <div className="flex flex-col w-full gap-6 items-start">
      <Tabs className="self-start w-full" defaultValue={activeDays[0]}>
        <Tabs.List>
          {getRemainingActiveDays().map((day, index) => {
            return <Tabs.Tab key={index} value={day} label={`${day}. ${fagfestivalMonth}`} onClick={() => setTabName(day)} />
          })}
          <Tabs.Tab
            value="påmeldte"
            label="Mine påmeldinger"
            onClick={() => setTabName("påmeldte")}
          />
        </Tabs.List>
      </Tabs>

      <div className="flex flex-col-reverse gap-2 items-start ax-md:flex-row justify-between w-full ax-md:items-center px-4">
        <Search
          label="Søk alle kommende arrangementer"
          variant="simple"
          value={searchInput}
          size="small"
          className="w-full ax-md:w-auto"
          onChange={(e) => {
            setSearchInput(e);
          }}
        />
      </div>

      {showProgramoversiktFilterOption && (
        <CheckboxGroup
          legend="Vis programoversikt"
          hideLegend
          className="-mt-5 -mb-2 ml-4"
          value={filterOptions}
          onChange={(newValues: FilterOption[]) => setFilterOptions(newValues)}
        >
          <Checkbox value="vis-programoversikt">Programoversikt</Checkbox>
        </CheckboxGroup>
      )}

      <div className="w-full p-4">
        {tabName == "25" && (
          <div className="pb-10 prose">
            <p>
              Husk å meld deg på{" "}
              <Link
                href="https://delta.nav.no/fagfest"
                className="text-ax-brand-blue-600 underline hover:no-underline"
              >
                felles avslutning
              </Link>{" "}
              og{" "}
              <Link
                href="https://delta.nav.no/fagfest"
                className="text-ax-brand-blue-600 underline hover:no-underline"
              >
                husfest etter fagfestival
              </Link>{" "}
              💃🕺
            </p>
          </div>
        )}
        <div className="w-full">
          {filterOptions.includes("vis-programoversikt") ? (
            <EventProgramOverview filteredEvents={filterEvents} loading={loading} />
          ) : (
            <EventList filteredEvents={filterEvents} loading={loading} />
          )}
        </div>
      </div>
    </div>
  );
};

export default FagfestivalEvents;
