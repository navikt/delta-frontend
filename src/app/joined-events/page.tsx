import CardWithBackground from "@/components/cardWithBackground";
import { FuturePastFilter } from "@/components/filters/future-past-filter";
import { EventList } from "@/components/eventList";
import { Suspense } from "react";
import { Skeleton } from "@navikt/ds-react/esm/skeleton";
import { TimeSelector } from "@/types/filter";

export default async function MyEvents({ searchParams }: any) {
  return (
    <CardWithBackground
      color="bg-blue-200"
      title="Påmeldte arrangementer"
      backLink="/"
    >
      <FuturePastFilter />
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
          onlyMine
          onlyFuture={searchParams.time === TimeSelector.FUTURE}
          onlyPast={searchParams.time === TimeSelector.PAST}
        />
      </Suspense>
    </CardWithBackground>
  );
}
