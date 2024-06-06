"use client";

import EventList from "@/components/fagtorsdag/views/eventList";
import EventProgramOverview from "@/components/fagtorsdag/views/eventProgramOverview";
import { getEvents } from "@/service/eventActions";
import { FilterOption, FullDeltaEvent } from "@/types/event";
import { Checkbox, CheckboxGroup, Search, Tabs } from "@navikt/ds-react";
import React, { useEffect, useRef, useState } from "react";

const fagfestivalCategory = "fagtorsdag";
const activeDays = ["13", "27"];
const fagfestivalMonth = "juni"

const getRemainingActiveDays = () => {
  const today = new Date();
  const dayOfMonth = today.getDate();
  return activeDays.filter(day => parseInt(day));
};

const getCurrentDayAsString = () => {
  const today = new Date();
  const dayOfMonth = today.getDate().toString();
  if (activeDays.includes(dayOfMonth)) {
    return dayOfMonth;
  } else {
    // Find the closest upcoming active day (including today if applicable)
    // @ts-ignore
    const upcomingActiveDays = activeDays.filter((day) => parseInt(day));
    return upcomingActiveDays.length > 0 ? upcomingActiveDays[0] : "påmeldte";
  }
};

const FestivalEvents = () => {
  const [searchInput, setSearchInput] = useState("");
  const [filterEvents, setFilterEvents] = useState<FullDeltaEvent[]>([]);
  const [filterOptions, setFilterOptions] = useState<FilterOption[]>(["vis-programoversikt"]);
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
    } else {
      // If the tab is not "påmeldte" or the device is not mobile, revert the filterOptions to its original state
      if (!filterOptions.includes("vis-programoversikt")) {
        setFilterOptions([...filterOptions, "vis-programoversikt"]);
      }
    }
  }, [isMobile, tabName]);

  const prevTabNameRef = useRef<string>();

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
      <Tabs className="self-start w-full" value={tabName}>
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

      <div className="flex flex-col-reverse gap-2 items-start md:flex-row justify-between w-full md:items-center px-4">
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
      </div>

{/*      {showProgramoversiktFilterOption && (
        <CheckboxGroup
          legend="Vis programoversikt"
          hideLegend
          className="-mt-5 -mb-2 ml-4"
          value={filterOptions}
          onChange={(newValues: FilterOption[]) => setFilterOptions(newValues)}
        >
          <Checkbox value="vis-programoversikt">Programoversikt</Checkbox>
        </CheckboxGroup>
      )}*/}

      <div className="w-full p-4">
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

export default FestivalEvents;
