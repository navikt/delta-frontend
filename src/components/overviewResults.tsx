"use client";

import { useEffect } from "react";
import type { Category, FullDeltaEvent, MyWaitlistEvent } from "@/types/event";
import { useQueryStates } from "nuqs";
import { BodyShort, Link, VStack } from "@navikt/ds-react";
import NextLink from "next/link";
import { homeParsers, homeView } from "@/service/overviewState";
import { filterActiveJoinedEvents, filterPastJoinedEvents, filterHomeCategories, homeDatasetKey } from "@/service/eventListQuery";
import { matchesEventSearch } from "@/service/eventSearch";
import EventList, { EmptyEventList, EventDayGroups } from "./eventList";
import EventResultsSkeleton from "./eventResultsSkeleton";
import { getHomeCategoryNames, shouldHideEventCard } from "./eventCardVisibility";
import { WaitlistEventCard } from "./waitlistEventCard";
import { useOverviewScroll } from "./useOverviewScroll";
import { useOverviewPath } from "./useOverviewPath";
import { useBrowserNow } from "./useBrowserNow";
import { ResultsStatus, resultsStatusMessage, useOptionalOverviewTransition } from "./overviewTransition";

function emptyMessage(view: string, search: string, showPast: boolean) {
  if (search.trim()) return `Fant ingen arrangementer som passer «${search.trim()}».`;
  switch (view) {
    case "pameldt": return showPast ? "Du har ingen tidligere påmeldinger i år."
      : "Du er ikke påmeldt noen kommende arrangementer.";
    case "mine": return showPast ? "Du har ikke arrangert noen tidligere arrangementer."
      : "Du har ingen kommende arrangementer som arrangør.";
    case "category": return "Det er ingen kommende arrangementer i denne kategorien.";
    default: return "Det er ingen kommende arrangementer akkurat nå.";
  }
}

export default function OverviewResults({
  events, categories, userEmail, datasetKey, fixedCategory = false,
}: {
  events: FullDeltaEvent[]; categories: Category[]; userEmail: string; datasetKey: string; fixedCategory?: boolean;
}) {
  const [state] = useQueryStates(homeParsers);
  const path = useOverviewPath();
  const now = useBrowserNow();
  const overview = useOptionalOverviewTransition();
  const view = fixedCategory ? "category" : homeView(state);
  const ready = (fixedCategory || datasetKey === homeDatasetKey(state, categories)) && now !== null;
  const showPast = (view === "mine" || view === "pameldt") && state.showPast;

  const loaded = view === "pameldt"
    ? (showPast ? filterPastJoinedEvents(events, now ?? 0) : filterActiveJoinedEvents(events, now ?? 0))
    : view === "alle" ? filterHomeCategories(events, state, categories)
    : events;
  const visible = now === null ? [] : loaded
    .filter(item => matchesEventSearch(item, state.search))
    .filter(item => !shouldHideEventCard({
      tabname: fixedCategory ? undefined : state.tab,
      categories: item.categories,
      signupDeadlineExpired: !!item.event.signupDeadline && new Date(item.event.signupDeadline).getTime() < now,
      showPast,
      showOnlyRegistered: view === "pameldt",
    }));

  const setAllCount = overview?.setAllCount;
  const allCount = ready && view === "alle" ? visible.length : null;
  useEffect(() => {
    if (allCount !== null) setAllCount?.(allCount);
  }, [allCount, setAllCount]);
  const setAvailableCategoryNames = overview?.setAvailableCategoryNames;
  useEffect(() => {
    if (!ready || view !== "alle" || now === null) return;
    const names = getHomeCategoryNames(events, now);
    setAvailableCategoryNames?.(previous =>
      previous?.length === names.length && previous.every((name, index) => name === names[index]) ? previous : names);
  }, [ready, view, now, events, setAvailableCategoryNames]);
  useOverviewScroll(path, ready);

  return <div className="w-full">
    <ResultsStatus message={resultsStatusMessage(ready, visible.length)} />
    {ready && now !== null ? (
      <VStack gap="space-24">
        <EventList fullEvents={visible} now={now} descending={showPast}
          showFagtorsdag={!fixedCategory}
          userEmail={fixedCategory ? undefined : userEmail}
          emptyMessage={emptyMessage(view, state.search, showPast)} />
        {view === "pameldt" && showPast && (
          <BodyShort>
            <Link as={NextLink} href="/mimretid">Se påmeldinger fra tidligere år i Mimretid</Link>
          </BodyShort>
        )}
      </VStack>
    ) : <EventResultsSkeleton announce={false} />}
  </div>;
}

export function WaitlistResults({ entries, datasetKey, categories }: {
  entries: MyWaitlistEvent[]; datasetKey: string; categories: Category[];
}) {
  const [state] = useQueryStates(homeParsers);
  const path = useOverviewPath();
  const now = useBrowserNow();
  const ready = datasetKey === homeDatasetKey(state, categories) && now !== null;
  useOverviewScroll(path, ready);

  const visible = ready ? entries.filter(entry => matchesEventSearch(entry, state.search)) : [];
  const status = <ResultsStatus message={resultsStatusMessage(ready, visible.length)} />;
  // Same wrapper in both states so the status region stays mounted.
  if (!ready || now === null) return <VStack gap="space-24" width="100%">{status}<EventResultsSkeleton announce={false} /></VStack>;
  return <VStack gap="space-24" width="100%">
    {status}
    <BodyShort textColor="subtle">
      Du blir automatisk påmeldt hvis du får plass før fristen. Du kan forlate ventelisten på arrangementssiden.
    </BodyShort>
    {visible.length ? (
      <EventDayGroups items={visible} now={now} showFagtorsdag renderItem={entry => <WaitlistEventCard entry={entry} />} />
    ) : (
      <EmptyEventList>{state.search.trim() ? `Fant ingen arrangementer som passer «${state.search.trim()}».`
        : "Du står ikke på noen ventelister for kommende arrangementer."}</EmptyEventList>
    )}
  </VStack>;
}
