"use client";

import EventList from "@/components/fagfestival/views/eventList";
import EventProgramOverview from "@/components/fagfestival/views/eventProgramOverview";
import { getEvents } from "@/service/eventActions";
import { FilterOption, FullDeltaEvent } from "@/types/event";
import { Checkbox, CheckboxGroup, Search, Tabs } from "@navikt/ds-react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";

const DEFAULT_FILTER_OPTION: FilterOption = "vis-programoversikt";
const JOINED_TAB = "påmeldte";

export type FagfestivalEventsProps = {
  category?: string;
  activeDays?: string[];
  month?: string;
  slug?: string;
};

type FestivalTab = string;

const monthIndexByName: Record<string, number> = {
  january: 0,
  januar: 0,
  february: 1,
  februar: 1,
  march: 2,
  mars: 2,
  april: 3,
  may: 4,
  mai: 4,
  june: 5,
  juni: 5,
  july: 6,
  juli: 6,
  august: 7,
  september: 8,
  october: 9,
  oktober: 9,
  november: 10,
  december: 11,
  desember: 11,
};

function isFestivalTab(value: string | null, activeDays: string[]): value is FestivalTab {
  return value !== null && (value === JOINED_TAB || activeDays.includes(value));
}

function getMonthIndex(month: string): number {
  const normalizedMonth = month.trim().toLowerCase();

  if (normalizedMonth in monthIndexByName) {
    return monthIndexByName[normalizedMonth];
  }

  const parsedMonthIndex = new Date(`${month} 1, 2000`).getMonth();
  return Number.isFinite(parsedMonthIndex) ? parsedMonthIndex : 0;
}

const getRemainingActiveDays = (activeDays: string[], monthIndex: number) => {
  const today = new Date();

  if (today.getMonth() !== monthIndex) {
    return activeDays;
  }

  const dayOfMonth = today.getDate();
  return activeDays.filter((day) => parseInt(day, 10) >= dayOfMonth);
};

const getCurrentDayAsString = (activeDays: string[], monthIndex: number) => {
  if (activeDays.length === 0) {
    return JOINED_TAB;
  }

  const today = new Date();
  const currentMonth = today.getMonth();

  if (currentMonth < monthIndex) {
    return activeDays[0];
  }

  if (currentMonth > monthIndex) {
    return JOINED_TAB;
  }

  const dayOfMonth = today.getDate().toString();

  if (activeDays.includes(dayOfMonth)) {
    return dayOfMonth;
  } else if (parseInt(activeDays[0], 10) > today.getDate()) {
    return activeDays[0];
  } else {
    return JOINED_TAB;
  }
};

function FagfestivalEvents({
  category = "fagfest",
  activeDays = ["28", "29", "30"],
  month = "April",
  slug = "fagfest",
}: FagfestivalEventsProps) {
  const festivalMonthIndex = getMonthIndex(month);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const searchParamsKey = searchParams.toString();
  const searchInput = searchParams.get("search") ?? "";
  const defaultTab = getCurrentDayAsString(activeDays, festivalMonthIndex);
  const tabParam = searchParams.get("tab");
  const tabName: FestivalTab = isFestivalTab(tabParam, activeDays) ? tabParam : defaultTab;
  const showProgramOverview = searchParams.get("view") === "program";
  const currentOverviewPath = `${pathname}${searchParamsKey ? `?${searchParamsKey}` : ""}`;

  const [filterEvents, setFilterEvents] = useState<FullDeltaEvent[]>([]);
  const [events, setEvents] = useState([] as FullDeltaEvent[]);
  const [joinedEventIds, setJoinedEventIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const hasRestoredScroll = useRef(false);

  const updateUrlState = (updates: {
    tab?: FestivalTab | null;
    search?: string | null;
    view?: "program" | null;
  }) => {
    const nextSearchParams = new URLSearchParams(searchParamsKey);

    if (updates.tab !== undefined) {
      if (updates.tab && updates.tab !== defaultTab) {
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
        fullEvent.categories.some((eventCategory) => eventCategory.name === category) &&
        passesDayFilter
      );
    });
    setFilterEvents(filteredEvents);
  }, [activeDays, category, events, searchInput, tabName]);

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

    if (tabName === JOINED_TAB && isMobile) {
      if (showProgramOverview) {
        updateUrlState({ view: null });
      }
    }
  }, [isMobile, showProgramOverview, tabName]);

  const prevTabNameRef = useRef<string | undefined>(undefined);

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

    if (tabName === JOINED_TAB) {
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

  const showProgramoversiktFilterOption = tabName !== JOINED_TAB || !isMobile;

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
          {getRemainingActiveDays(activeDays, festivalMonthIndex).map((day) => {
            return (
              <Tabs.Tab
                key={day}
                value={day}
                label={`${day}. ${month}`}
                onClick={() => updateUrlState({ tab: day })}
              />
            );
          })}
          <Tabs.Tab
            value={JOINED_TAB}
            label="Mine påmeldinger"
            onClick={() => updateUrlState({ tab: JOINED_TAB })}
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
              slug={slug}
            />
          ) : (
            <EventList
              filteredEvents={filterEvents}
              loading={loading}
              returnTo={currentOverviewPath}
              joinedEventIds={joinedEventIds}
              slug={slug}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default FagfestivalEvents;
