import { Suspense } from "react";
import { getEvents } from "@/service/eventQueries";
import type { FestivalConfig } from "./festivalConfig";
import FestivalEventsClient from "./festivalEventsClient";
import { Skeleton } from "@navikt/ds-react";

function FestivalEventsSkeleton() {
  return (
    <div className="space-y-4 p-4">
      <Skeleton variant="rounded" height={40} />
      <Skeleton variant="rounded" height={200} />
      <Skeleton variant="rounded" height={200} />
    </div>
  );
}

async function FestivalEventsData({ config }: { config: FestivalConfig }) {
  const events = await getEvents({ onlyFuture: true });
  return <FestivalEventsClient config={config} initialEvents={events} />;
}

export default function FestivalEventsSection({
  config,
}: {
  config: FestivalConfig;
}) {
  return (
    <Suspense fallback={<FestivalEventsSkeleton />}>
      <FestivalEventsData config={config} />
    </Suspense>
  );
}
