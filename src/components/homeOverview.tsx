import { Suspense } from "react";
import { VStack } from "@navikt/ds-react";
import { checkToken, getUser } from "@/auth/token";
import EventFilters, { OverviewCreateLink } from "./eventFilters";
import OverviewResults, { WaitlistResults } from "./overviewResults";
import ResultsBoundary from "./resultsBoundary";
import EventResultsSkeleton, { OVERVIEW_RESULTS_ID } from "./eventResultsSkeleton";
import { OverviewTransition } from "./overviewTransition";
import { getAllCategories, getEvents } from "@/service/eventQueries";
import { loadOverview } from "@/service/overviewQueries";
import { getMyWaitlists } from "@/service/waitlistQueries";
import { homeView, loadHomeState, type OverviewSearchParams, type HomeState } from "@/service/overviewState";
import { homeDatasetKey } from "@/service/eventListQuery";
import type { Category } from "@/types/event";

async function Results(props: {
  state: HomeState; categories: Category[]; userEmail: string; datasetKey: string; returnTo: string; categoryScope?: Category;
}) {
  if (homeView(props.state) === "ventelister") {
    const [entries, categoryEvents] = await Promise.all([
      getMyWaitlists(),
      props.categoryScope ? getEvents({ categories: [props.categoryScope] }, props.returnTo) : undefined,
    ]);
    const eventIds = categoryEvents ? new Set(categoryEvents.map(item => item.event.id)) : null;
    return <WaitlistResults entries={eventIds ? entries.filter(entry => eventIds.has(entry.event.id)) : entries}
      categories={props.categories} datasetKey={props.datasetKey} categoryScope={props.categoryScope} />;
  }
  const events = await loadOverview(props.state, props.categories, props.categoryScope, props.returnTo);
  return <OverviewResults {...props} events={events} />;
}

export default async function HomeOverview({ searchParams, returnTo = "/", categoryScope }: {
  searchParams: Promise<OverviewSearchParams>; returnTo?: string; categoryScope?: Category;
}) {
  await checkToken(returnTo);
  const [categories, user, state] = await Promise.all([getAllCategories(returnTo), getUser(), loadHomeState(searchParams)]);
  const datasetKey = homeDatasetKey(state, categories, categoryScope);
  return <OverviewTransition>
    <VStack gap="space-24">
      <EventFilters categories={categories} categoryScope={categoryScope} />
      <div id={OVERVIEW_RESULTS_ID}>
        <ResultsBoundary key={datasetKey}>
          <Suspense key={datasetKey} fallback={<EventResultsSkeleton />}>
            <Results state={state} categories={categories} userEmail={user.email} datasetKey={datasetKey}
              categoryScope={categoryScope} returnTo={returnTo} />
          </Suspense>
        </ResultsBoundary>
      </div>
      <OverviewCreateLink />
    </VStack>
  </OverviewTransition>;
}