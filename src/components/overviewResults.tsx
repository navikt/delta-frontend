"use client";

import type { Category, FullDeltaEvent } from "@/types/event";
import { useQueryStates } from "nuqs";
import { homeParsers } from "@/service/overviewState";
import { eventDatasetKey, filterActiveJoinedEvents, getHomeEventQuery } from "@/service/eventListQuery";
import EventList from "./eventList";
import EventResultsSkeleton from "./eventResultsSkeleton";
import { useOverviewScroll } from "./useOverviewScroll";
import { useOverviewPath } from "./useOverviewPath";
import { BodyShort } from "@navikt/ds-react";
import { useBrowserNow } from "./useBrowserNow";

export default function OverviewResults({
  events, categories, userEmail, datasetKey, fixedCategory = false,
}: {
  events: FullDeltaEvent[]; categories: Category[]; userEmail: string; datasetKey: string; fixedCategory?: boolean;
}) {
  const [state] = useQueryStates(homeParsers);
  const path = useOverviewPath();
  const now = useBrowserNow();
  const joined = !fixedCategory && state.onlyRegistered;
  const ready = (fixedCategory || datasetKey === eventDatasetKey("home", getHomeEventQuery(state, categories))) &&
    (!joined || now !== null);
  const visible = joined && now !== null ? filterActiveJoinedEvents(events, now)
    : !fixedCategory && state.tab === "mine" ? events
    : events.filter(item => item.event.title.toLowerCase().includes(state.search.toLowerCase()));
  useOverviewScroll(path, ready && now !== null);
  if (!ready) return <EventResultsSkeleton />;
  return <div className="w-full p-4" aria-busy="false">
    {!fixedCategory && visible.length > 0 && <BodyShort className="pb-4">{visible.length} {visible.length === 1 ? "arrangement" : "arrangementer"}</BodyShort>}
    <EventList fullEvents={visible} loading={false}
      showAll={!fixedCategory && state.showPast ? ["10"] : []}
      tabname={fixedCategory ? undefined : state.tab} userEmail={fixedCategory ? undefined : userEmail}
      showOnlyRegistered={!fixedCategory && state.onlyRegistered} />
  </div>;
}
