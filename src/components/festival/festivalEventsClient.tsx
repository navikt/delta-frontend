"use client";

import FestivalEventList from "./festivalEventList";
import FestivalProgramOverview from "./festivalProgramOverview";
import { getEvents } from "@/service/eventActions";
import type { FestivalConfig } from "./festivalConfig";
import { FullDeltaEvent } from "@/types/event";
import { Search, Tabs } from "@navikt/ds-react";
import React, { useEffect, useMemo, useRef, useState } from "react";

function getRemainingActiveDays(config: FestivalConfig) {
  const today = new Date();
  const dayOfMonth = today.getDate();
  if (config.filterFutureDaysOnly) {
    return config.activeDays.filter((day) => parseInt(day) >= dayOfMonth);
  }
  return config.activeDays;
}

function getCurrentDayAsString(config: FestivalConfig) {
  const today = new Date();
  const dayOfMonth = today.getDate().toString();
  if (config.activeDays.includes(dayOfMonth)) {
    return dayOfMonth;
  }
  const upcomingActiveDays = config.filterFutureDaysOnly
    ? config.activeDays.filter(
        (day) => parseInt(day) >= parseInt(dayOfMonth),
      )
    : config.activeDays;
  return upcomingActiveDays.length > 0 ? upcomingActiveDays[0] : "påmeldte";
}

type FestivalEventsClientProps = {
  config: FestivalConfig;
  initialEvents: FullDeltaEvent[];
};

export default function FestivalEventsClient({
  config,
  initialEvents,
}: FestivalEventsClientProps) {
  const [searchInput, setSearchInput] = useState("");
  const [tabName, setTabName] = useState(getCurrentDayAsString(config));
  const [events, setEvents] = useState(initialEvents);
  const [loading, setLoading] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const filteredEvents = useMemo(() => {
    return events.filter((fullEvent) => {
      let passesDayFilter = true;
      if (config.activeDays.includes(tabName)) {
        const startTime = new Date(fullEvent.event.startTime);
        const dayOfMonth = startTime.getDate();
        passesDayFilter = dayOfMonth.toString() === tabName;
      }
      return (
        fullEvent.event.title
          .toLowerCase()
          .includes(searchInput.toLowerCase()) &&
        fullEvent.categories.some(
          (category) => category.name === config.category,
        ) &&
        passesDayFilter
      );
    });
  }, [events, searchInput, tabName, config]);

  const showProgramOverview = useMemo(() => {
    if (tabName === "påmeldte" && isMobile) return false;
    return true;
  }, [tabName, isMobile]);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener("resize", handleResize);
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const prevTabNameRef = useRef<string>(undefined);

  useEffect(() => {
    const prevTabName = prevTabNameRef.current;
    prevTabNameRef.current = tabName;

    const noReloadNeeded =
      prevTabName &&
      (prevTabName === tabName ||
        (config.activeDays.includes(tabName) &&
          config.activeDays.includes(prevTabName)));

    if (noReloadNeeded) return;

    setLoading(true);
    getEvents({
      onlyFuture: true,
      ...(tabName === "påmeldte" ? { onlyJoined: true } : {}),
    })
      .then(setEvents)
      .then(() => setLoading(false));
  }, [tabName, config]);

  return (
    <div className="flex flex-col w-full gap-6 items-start">
      <Tabs className="self-start w-full" value={tabName}>
        <Tabs.List>
          {getRemainingActiveDays(config).map((day, index) => (
            <Tabs.Tab
              key={index}
              value={day}
              label={`${day}. ${config.month}`}
              onClick={() => setTabName(day)}
            />
          ))}
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
          onChange={(e) => setSearchInput(e)}
        />
      </div>

      <div className="w-full p-4">
        <div className="w-full">
          {showProgramOverview ? (
            <FestivalProgramOverview
              filteredEvents={filteredEvents}
              loading={loading}
              basePath={config.basePath}
              hiddenCategoryNames={config.hiddenCategoryNames}
            />
          ) : (
            <FestivalEventList
              filteredEvents={filteredEvents}
              loading={loading}
              basePath={config.basePath}
              hiddenCategoryNames={config.hiddenCategoryNames}
            />
          )}
        </div>
      </div>
    </div>
  );
}
