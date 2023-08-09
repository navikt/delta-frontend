import { Skeleton } from "@navikt/ds-react/esm/skeleton";
import { checkToken } from "@/auth/token";
import CardWithBackground from "@/components/cardWithBackground";
import { CategoryFilter } from "@/components/filters/category-filter";
import { SearchFilter } from "@/components/filters/search-filter";
import { getAllCategories, getEvents } from "@/service/eventActions";
import { Suspense } from "react";
import { EventList } from "@/components/eventList";

export default async function Home({ searchParams }: any) {
  await checkToken();

  const allCategories = await getAllCategories();

  return (
    <CardWithBackground color="bg-blue-200" title="Arrangementer" newEvent>
      <div className="flex justify-between mb-2">
        <SearchFilter />
        <CategoryFilter allCategories={allCategories} />
      </div>
      <div className="flex flex-col w-full gap-6 items-start">
        <Suspense
          fallback={
            <>
              <Skeleton variant="rounded" />
              <Skeleton variant="rounded" />
              <Skeleton variant="rounded" />
              <Skeleton variant="rounded" />
            </>
          }
        >
          <EventList
            categories={searchParams.categories?.split(",") ?? []}
          />
        </Suspense>
      </div>
    </CardWithBackground>
  );
}

