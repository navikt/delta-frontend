import { Suspense } from "react";
import { checkToken, getUser } from "@/auth/token";
import CardWithBackground from "@/components/cardWithBackground";
import CategoryControls from "@/components/eventFiltersCategory";
import OverviewResults from "@/components/overviewResults";
import ResultsBoundary from "@/components/resultsBoundary";
import EventResultsSkeleton from "@/components/eventResultsSkeleton";
import { getEvents } from "@/service/eventQueries";
import { resolveFixedCategory } from "@/service/overviewQueries";
import { eventDatasetKey, getFixedCategoryQuery } from "@/service/eventListQuery";
import type { Category } from "@/types/event";
import type { Metadata } from "next";

type CategoryPageProps = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { id } = await params;
  return { title: `${id} Δ Delta` };
}

async function Results({ category, userEmail, returnTo }: { category: Category; userEmail: string; returnTo: string }) {
  const query = getFixedCategoryQuery(category);
  const events = await getEvents(query, returnTo);
  return <OverviewResults events={events} categories={[category]} userEmail={userEmail}
    datasetKey={eventDatasetKey("category", query)} fixedCategory />;
}

export default async function Page({ params }: CategoryPageProps) {
  const { id } = await params;
  const returnTo = `/kategori/${id}`;
  await checkToken(returnTo);
  const [category, user] = await Promise.all([resolveFixedCategory(id, returnTo), getUser()]);
  if (!category) return <section className="w-screen flex-grow flex justify-center items-center">404 - Kategorien finnes ikke</section>;
  return <main className="flex flex-grow">
    <CardWithBackground title={category.name.charAt(0).toUpperCase() + category.name.slice(1)}
      newEvent home scrollToTopOnMount={false}>
      <CategoryControls />
      <ResultsBoundary key={category.id}>
        <Suspense fallback={<EventResultsSkeleton />}>
          <Results category={category} userEmail={user.email} returnTo={returnTo} />
        </Suspense>
      </ResultsBoundary>
    </CardWithBackground>
  </main>;
}
