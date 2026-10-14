"use client";

import { useMemo } from "react";
import { useQueryStates } from "nuqs";
import Link from "next/link";
import { festivalParsers } from "@/service/overviewState";
import { festivalBrowserPlan, filterFestivalEvents, joinedFestivalEventIds, JOINED_TAB, type ResolvedFestival } from "@/service/festivalPolicy";
import { eventDatasetKey, getFestivalEventQuery } from "@/service/eventListQuery";
import type { Category, FullDeltaEvent } from "@/types/event";
import EventList from "./views/eventList";
import EventProgramOverview from "./views/eventProgramOverview";
import EventResultsSkeleton from "../eventResultsSkeleton";
import { useOverviewScroll } from "../useOverviewScroll";
import { useOverviewPath } from "../useOverviewPath";
import { BodyShort } from "@navikt/ds-react";
import { useBrowserNow } from "../useBrowserNow";

export default function FestivalResults({ events, festival: serverFestival, userEmail, datasetKey, category }: {
  events: FullDeltaEvent[]; festival: ResolvedFestival; userEmail: string; datasetKey: string; category?: Category;
}) {
  const browserReady = useBrowserNow() !== null;
  const festival = useMemo(() => browserReady
    ? festivalBrowserPlan(serverFestival, null).festival : serverFestival, [serverFestival, browserReady]);
  const parsers = useMemo(() => festivalParsers(festival.defaultTab, festival.tabs), [festival]);
  const [state] = useQueryStates(parsers);
  const returnTo = useOverviewPath();
  const ready = browserReady && datasetKey === eventDatasetKey(`festival:${festival.category}`,
    getFestivalEventQuery(category, state.tab === JOINED_TAB));
  const filteredEvents = ready ? filterFestivalEvents(events, festival, state) : [];
  const joinedEventIds = joinedFestivalEventIds(events, userEmail);
  useOverviewScroll(returnTo, ready);
  if (!ready) return <EventResultsSkeleton />;
  const ResultView = state.view === "program" ? EventProgramOverview : EventList;
  return <div className="w-full p-4" aria-busy="false">
    {state.tab === "25" && <div className="pb-10 prose"><BodyShort>
      Husk å melde deg på{" "}
      <Link href="https://delta.nav.no/fagfest" className="text-ax-brand-blue-600 underline hover:no-underline">felles avslutning</Link>
      {" "}og{" "}
      <Link href="https://delta.nav.no/fagfest" className="text-ax-brand-blue-600 underline hover:no-underline">husfest etter fagfestival</Link>
    </BodyShort></div>}
    <ResultView filteredEvents={filteredEvents} loading={false} returnTo={returnTo}
      joinedEventIds={joinedEventIds} slug={festival.slug} />
  </div>;
}
