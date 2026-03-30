import { Suspense } from "react";
import { checkToken, getUser } from "@/auth/token";
import CardWithBackground from "@/components/cardWithBackground";
import FilterBar from "@/components/filters/filterBar";
import EventListSection from "@/components/eventListSection";
import EventListSkeleton from "@/components/eventListSkeleton";
import { getAllCategories } from "@/service/eventQueries";
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Delta Δ Nav',
};

type HomeTab = "alle" | "mine";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  await checkToken("/");
  const params = await searchParams;

  const [categories, user] = await Promise.all([getAllCategories(), getUser()]);

  // Extract filter state from URL params
  const tabname = (params.tab === "mine" ? "mine" : "alle") as HomeTab;
  const showPast = params.showPast === "1";
  const categoryNames = typeof params.categories === "string"
    ? params.categories.split(",").map((s) => s.trim()).filter(Boolean)
    : [];

  // Resolve category names to IDs
  const categoryIds = categoryNames
    .map((name) => categories.find((c) => c.name === name)?.id)
    .filter((id): id is number => id !== undefined);

  // Determine API-level time filters
  const onlyFuture = tabname === "alle" || !showPast;
  const onlyPast = tabname !== "alle" && showPast;
  const onlyMine = tabname === "mine";

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
          tabname={tabname}
          userEmail={user.email}
        />
      </Suspense>
    </CardWithBackground>
  );
}

