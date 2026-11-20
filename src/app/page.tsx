import { Suspense } from "react";
import CardWithBackground from "@/components/cardWithBackground";
import HomeOverview from "@/components/homeOverview";
import EventResultsSkeleton from "@/components/eventResultsSkeleton";
import type { OverviewSearchParams } from "@/service/overviewState";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Delta Δ Nav" };

export default function Home({ searchParams }: { searchParams: Promise<OverviewSearchParams> }) {
  return <CardWithBackground title="Arrangementer" scrollToTopOnMount={false} bare>
    <Suspense fallback={<EventResultsSkeleton />}><HomeOverview searchParams={searchParams} /></Suspense>
  </CardWithBackground>;
}
