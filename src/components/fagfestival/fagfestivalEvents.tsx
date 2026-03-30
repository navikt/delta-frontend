"use client";

import EventList from "@/components/fagfestival/views/eventList";
import EventProgramOverview from "@/components/fagfestival/views/eventProgramOverview";
import { getEvents } from "@/service/eventActions";
import { FilterOption, FullDeltaEvent } from "@/types/event";
import { Checkbox, CheckboxGroup, Search, Tabs } from "@navikt/ds-react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";

const fagfestivalCategory = "fagfest";
const activeDays = ["28", "29", "30"];
const fagfestivalMonth = "April";
const fagfestivalMonthIndex = new Date(`${fagfestivalMonth} 1, 2000`).getMonth();
const DEFAULT_FILTER_OPTION: FilterOption = "vis-programoversikt";
const TAB_VALUES = [...activeDays, "påmeldte"] as const;
type FagfestTab = (typeof TAB_VALUES)[number];

function isFagfestTab(value: string | null): value is FagfestTab {
  return value !== null && TAB_VALUES.includes(value as FagfestTab);
}

const getRemainingActiveDays = () => {
  const today = new Date();

  if (today.getMonth() !== fagfestivalMonthIndex) {
    return activeDays;
  }

  const dayOfMonth = today.getDate();
  return activeDays.filter((day) => parseInt(day) >= dayOfMonth);
};

const getCurrentDayAsString = () => {
  const today = new Date();
  const currentMonth = today.getMonth();

  if (currentMonth < fagfestivalMonthIndex) {
    return activeDays[0];
  }

  if (currentMonth > fagfestivalMonthIndex) {
    return "påmeldte";
  }

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
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const searchParamsKey = searchParams.toString();
  const searchInput = searchParams.get("search") ?? "";
  const tabName: FagfestTab = isFagfestTab(searchParams.get("tab"))
    ? (searchParams.get("tab") as FagfestTab)
    : getCurrentDayAsString();
  const showProgramOverview = searchParams.get("view") === "program";
  const currentOverviewPath = `${pathname}${searchParamsKey ? `?${searchParamsKey}` : ""}`;

  const [filterEvents, setFilterEvents] = useState<FullDeltaEvent[]>([]);
  const [events, setEvents] = useState([] as FullDeltaEvent[]);
  const [joinedEventIds, setJoinedEventIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const hasRestoredScroll = useRef(false);

  const updateUrlState = (updates: {
    tab?: FagfestTab | null;
    search?: string | null;
    view?: "program" | null;
  }) => {
    const nextSearchParams = new URLSearchParams(searchParamsKey);

    if (updates.tab !== undefined) {
      if (updates.tab && updates.tab !== getCurrentDayAsString()) {
        nextSearchParams.set("tab", updates.tab);
      } else {
        nextSearchParams.delete("tab");
      }
    }

    if (updates.search !== undefined) {
      if (updates.search) {
        nextSearchParams.set("search", updates.search);
      } else {
        nextSearchParams.delete("search");
      }
    }

    if (updates.view !== undefined) {
      if (updates.view === "program") {
        nextSearchParams.set("view", "program");
      } else {
        nextSearchParams.delete("view");
      }
    }

    const nextSearch = nextSearchParams.toString();
    router.replace(nextSearch ? `${pathname}?${nextSearch}` : pathname, { scroll: false });
  };

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

    Promise.all([
      getEvents({
        onlyFuture: true,
      }),
      getEvents({
        onlyFuture: true,
        onlyJoined: true,
      }),
    ]).then(([allEvents, joinedEvents]) => {
      setEvents(allEvents);
      setJoinedEventIds(new Set(joinedEvents.map((event) => event.event.id)));
      setLoading(false);
    });

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
      if (showProgramOverview) {
        updateUrlState({ view: null });
      }
    }
  }, [isMobile, showProgramOverview, tabName]);

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
        .then((joinedEvents) => {
          setEvents(joinedEvents);
          setJoinedEventIds(new Set(joinedEvents.map((event) => event.event.id)));
        })
        .then(() => setLoading(false));
    } else {
      Promise.all([
        getEvents({
          onlyFuture: true,
        }),
        getEvents({
          onlyFuture: true,
          onlyJoined: true,
        }),
      ])
        .then(([allEvents, joinedEvents]) => {
          setEvents(allEvents);
          setJoinedEventIds(new Set(joinedEvents.map((event) => event.event.id)));
        })
        .then(() => setLoading(false));
    }
  }, [tabName]);

  const showProgramoversiktFilterOption = tabName !== "påmeldte" || !isMobile;

  useEffect(() => {
    hasRestoredScroll.current = false;
  }, [currentOverviewPath]);

  useEffect(() => {
    if (loading || hasRestoredScroll.current) {
      return;
    }

    const savedScrollY = sessionStorage.getItem(`event-overview-scroll:${currentOverviewPath}`);
    hasRestoredScroll.current = true;

    if (!savedScrollY) {
      return;
    }

    const parsedScrollY = Number(savedScrollY);

    if (!Number.isFinite(parsedScrollY)) {
      sessionStorage.removeItem(`event-overview-scroll:${currentOverviewPath}`);
      return;
    }

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        window.scrollTo({ top: parsedScrollY, behavior: "auto" });
        sessionStorage.removeItem(`event-overview-scroll:${currentOverviewPath}`);
      });
    });
  }, [currentOverviewPath, filterEvents.length, loading]);

  return (
    <div className="flex flex-col w-full gap-6 items-start">
      <Tabs className="self-start w-full" value={tabName}>
        <Tabs.List>
          {getRemainingActiveDays().map((day, index) => {
            return (
              <Tabs.Tab
                key={index}
                value={day}
                label={`${day}. ${fagfestivalMonth}`}
                onClick={() => updateUrlState({ tab: day as FagfestTab })}
              />
            );
          })}
          <Tabs.Tab
            value="påmeldte"
            label="Mine påmeldinger"
            onClick={() => updateUrlState({ tab: "påmeldte" })}
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
          onChange={(value) => {
            updateUrlState({ search: value || null });
          }}
        />
      </div>

      {showProgramoversiktFilterOption && (
        <CheckboxGroup
          legend="Vis programoversikt"
          hideLegend
          className="-mt-5 -mb-2 ml-4"
          value={showProgramOverview ? [DEFAULT_FILTER_OPTION] : []}
          onChange={(newValues: FilterOption[]) =>
            updateUrlState({
              view: newValues.includes(DEFAULT_FILTER_OPTION) ? "program" : null,
            })
          }
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
          {showProgramOverview ? (
            <EventProgramOverview
              filteredEvents={filterEvents}
              loading={loading}
              returnTo={currentOverviewPath}
              joinedEventIds={joinedEventIds}
            />
          ) : (
            <EventList
              filteredEvents={filterEvents}
              loading={loading}
              returnTo={currentOverviewPath}
              joinedEventIds={joinedEventIds}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default FagfestivalEvents;
