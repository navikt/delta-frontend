import "server-only";
import { Suspense } from "react";
import { createLoader } from "nuqs/server";
import { checkToken, getUser } from "@/auth/token";
import { getAllCategories, getEvents } from "@/service/eventQueries";
import { festivalParsers, type OverviewSearchParams } from "@/service/overviewState";
import { resolveFestival, JOINED_TAB, type FestivalConfig, type ResolvedFestival } from "@/service/festivalPolicy";
import { eventDatasetKey, getFestivalEventQuery } from "@/service/eventListQuery";
import type { Category } from "@/types/event";
import FestivalControls from "./festivalControls";
import FestivalResults from "./festivalResults";
import ResultsBoundary from "@/components/resultsBoundary";
import EventResultsSkeleton from "@/components/eventResultsSkeleton";
import { OverviewTransition } from "@/components/overviewTransition";

export type FagfestivalEventsProps = FestivalConfig & { searchParams: Promise<OverviewSearchParams> };

async function Results({ festival, category, joined, userEmail, datasetKey }: {
  festival: ResolvedFestival; category?: Category; joined: boolean; userEmail: string; datasetKey: string;
}) {
  const events = await getEvents(getFestivalEventQuery(category, joined), `/${festival.slug}`);
  const scopedEvents = events.filter(item => item.categories.some(value => value.name === festival.category));
  return <FestivalResults events={scopedEvents} festival={festival} userEmail={userEmail}
    datasetKey={datasetKey} category={category} />;
}

async function FestivalOverview({ searchParams, ...config }: FagfestivalEventsProps) {
  const festival = resolveFestival(config, new Date());
  const returnTo = `/${festival.slug}`;
  await checkToken(returnTo);
  const [catalog, user, params] = await Promise.all([getAllCategories(returnTo), getUser(), searchParams]);
  const state = createLoader(festivalParsers(festival.defaultTab, festival.tabs))(params);
  const category = catalog.find(value => value.name === festival.category);
  const joined = state.tab === JOINED_TAB;
  const datasetKey = eventDatasetKey(`festival:${festival.category}`, getFestivalEventQuery(category, joined));
  return <OverviewTransition>
    <FestivalControls festival={festival} />
    <ResultsBoundary key={datasetKey}>
      <Suspense key={datasetKey} fallback={<EventResultsSkeleton />}>
        <Results festival={festival} category={category} joined={joined} userEmail={user.email} datasetKey={datasetKey} />
      </Suspense>
    </ResultsBoundary>
  </OverviewTransition>;
}

export default function FagfestivalEvents(props: FagfestivalEventsProps) {
  return <Suspense fallback={<EventResultsSkeleton />}><FestivalOverview {...props} /></Suspense>;
}
