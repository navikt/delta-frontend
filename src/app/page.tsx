import { Suspense } from "react";
import { checkToken, getUser } from "@/auth/token";
import CardWithBackground from "@/components/cardWithBackground";
import FilterBar from "@/components/filters/filterBar";
import EventListSection from "@/components/eventListSection";
import EventListSkeleton from "@/components/eventListSkeleton";
import { getAllCategories } from "@/service/eventQueries";
import { Metadata } from 'next';
import { createSearchParamsCache } from "nuqs/server";
import { filterParsers } from "@/components/filters/filterParams";

export const metadata: Metadata = {
  title: 'Delta Δ Nav',
};

const searchParamsCache = createSearchParamsCache(filterParsers);

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  await checkToken("/");
  const params = searchParamsCache.parse(await searchParams);

  const [categories, user] = await Promise.all([getAllCategories(), getUser()]);

  // Resolve category names to IDs
  const categoryIds = params.categories
    .map((name) => categories.find((c) => c.name === name)?.id)
    .filter((id): id is number => id !== undefined);

  // Determine API-level time filters
  const onlyFuture = params.tab === "alle" || !params.showPast;
  const onlyPast = params.tab !== "alle" && params.showPast;
  const onlyMine = params.tab === "mine";

  return (
    <CardWithBackground
      title="Arrangementer"
      newEvent
      scrollToTopOnMount={false}
    >
      <FilterBar categories={categories} userEmail={user.email} />
      <Suspense fallback={<EventListSkeleton />}>
        <EventListSection
          categoryIds={categoryIds}
          onlyFuture={onlyFuture}
          onlyPast={onlyPast}
          onlyMine={onlyMine}
          tabname={params.tab}
          userEmail={user.email}
        />
      </Suspense>
    </CardWithBackground>
  );
}

