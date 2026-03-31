import { Suspense } from "react";
import CardWithBackground from "@/components/cardWithBackground";
import EventListSkeleton from "@/components/eventListSkeleton";
import UserAwareSection from "@/components/userAwareSection";
import { Metadata } from 'next';
import { createSearchParamsCache } from "nuqs/server";
import { filterParsers } from "@/components/filters/filterParams";

export const metadata: Metadata = {
  title: 'Delta Δ Nav',
};

export const unstable_instant = {
  prefetch: "runtime",
  samples: [{ headers: [["authorization", null]] }],
};

const searchParamsCache = createSearchParamsCache(filterParsers);

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = searchParamsCache.parse(await searchParams);

  return (
    <CardWithBackground
      title="Arrangementer"
      newEvent
      scrollToTopOnMount={false}
    >
      <Suspense fallback={<EventListSkeleton />}>
        <UserAwareSection params={params} />
      </Suspense>
    </CardWithBackground>
  );
}

