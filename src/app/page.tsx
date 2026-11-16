import { Suspense } from "react";
import { VStack } from "@navikt/ds-react";
import { checkToken, getUser } from "@/auth/token";
import CardWithBackground from "@/components/cardWithBackground";
import EventFilters, { OverviewCreateLink } from "@/components/eventFilters";
import OverviewResults, { WaitlistResults } from "@/components/overviewResults";
import ResultsBoundary from "@/components/resultsBoundary";
import EventResultsSkeleton from "@/components/eventResultsSkeleton";
import { OverviewTransition } from "@/components/overviewTransition";
import { getAllCategories } from "@/service/eventQueries";
import { loadOverview } from "@/service/overviewQueries";
import { getMyWaitlists } from "@/service/waitlistQueries";
import { homeView, loadHomeState, type OverviewSearchParams, type HomeState } from "@/service/overviewState";
import { homeDatasetKey } from "@/service/eventListQuery";
import type { Category } from "@/types/event";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Delta Δ Nav" };

async function Results(props: { state: HomeState; categories: Category[]; userEmail: string; datasetKey: string }) {
  if (homeView(props.state) === "ventelister") {
    const entries = await getMyWaitlists();
    return <WaitlistResults entries={entries} categories={props.categories} datasetKey={props.datasetKey} />;
  }
  const events = await loadOverview(props.state, props.categories);
  return <OverviewResults {...props} events={events} />;
}

async function Overview({ searchParams }: { searchParams: Promise<OverviewSearchParams> }) {
  await checkToken("/");
  const [categories, user, state] = await Promise.all([getAllCategories("/"), getUser(), loadHomeState(searchParams)]);
  const datasetKey = homeDatasetKey(state, categories);
  return <OverviewTransition>
    <VStack gap="space-24">
      <EventFilters categories={categories} />
      <ResultsBoundary key={datasetKey}>
        <Suspense key={datasetKey} fallback={<EventResultsSkeleton />}>
          <Results state={state} categories={categories} userEmail={user.email} datasetKey={datasetKey} />
        </Suspense>
      </ResultsBoundary>
      <OverviewCreateLink />
    </VStack>
  </OverviewTransition>;
}

export default function Home({ searchParams }: { searchParams: Promise<OverviewSearchParams> }) {
  return <CardWithBackground title="Arrangementer" scrollToTopOnMount={false} bare>
    <Suspense fallback={<EventResultsSkeleton />}><Overview searchParams={searchParams} /></Suspense>
  </CardWithBackground>;
}
