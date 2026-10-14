import { Suspense } from "react";
import { checkToken } from "@/auth/token";
import { getAllCategories, getEvents } from "@/service/eventQueries";
import { getFixedCategoryQuery } from "@/service/eventListQuery";
import EventResultsSkeleton from "@/components/eventResultsSkeleton";
import ResultsBoundary from "@/components/resultsBoundary";
import type { Category } from "@/types/event";
import type { Metadata } from "next";

type CategoryPageProps = { params: Promise<{ id: string }> };
export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { id } = await params;
  return { title: `${id} Δ Delta` };
}

async function Results({ category, returnTo }: { category: Category; returnTo: string }) {
  const events = await getEvents(getFixedCategoryQuery(category), returnTo);
  return <div className="flex flex-col w-full gap-6 items-start"><pre>{JSON.stringify(events, null, 2)}</pre></div>;
}

export default async function Page({ params }: CategoryPageProps) {
  const { id } = await params;
  const returnTo = `/json/${id}`;
  await checkToken(returnTo);
  const categories = await getAllCategories(returnTo);
  const category = categories.find(item => item.name === id);
  if (!category) return <section className="w-screen flex-grow flex justify-center items-center">404 - Kategorien ble ikke funnet</section>;
  return <ResultsBoundary>
    <Suspense fallback={<EventResultsSkeleton />}><Results category={category} returnTo={returnTo} /></Suspense>
  </ResultsBoundary>;
}
