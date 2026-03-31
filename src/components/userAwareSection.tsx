import { getUser } from "@/auth/token";
import { getAllCategories } from "@/service/eventQueries";
import FilterBar from "@/components/filters/filterBar";
import EventListSection from "@/components/eventListSection";
import EventListSkeleton from "@/components/eventListSkeleton";
import { ParsedFilters } from "@/components/filters/filterParams";
import { Suspense } from "react";

export default async function UserAwareSection({ params }: { params: ParsedFilters }) {
  const [categories, user] = await Promise.all([getAllCategories(), getUser()]);

  const categoryIds = params.categories
    .map((name) => categories.find((c) => c.name === name)?.id)
    .filter((id): id is number => id !== undefined);

  const onlyFuture = params.tab === "alle" || !params.showPast;
  const onlyPast = params.tab !== "alle" && params.showPast;
  const onlyMine = params.tab === "mine";

  return (
    <>
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
    </>
  );
}
