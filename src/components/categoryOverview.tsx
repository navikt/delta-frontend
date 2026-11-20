import { Suspense } from "react";
import { notFound } from "next/navigation";
import { checkToken } from "@/auth/token";
import CardWithBackground from "./cardWithBackground";
import HomeOverview from "./homeOverview";
import EventResultsSkeleton from "./eventResultsSkeleton";
import { resolveFixedCategory } from "@/service/overviewQueries";
import type { OverviewSearchParams } from "@/service/overviewState";

export default async function CategoryOverview({ id, returnTo, searchParams }: {
  id: string; returnTo: string; searchParams: Promise<OverviewSearchParams>;
}) {
  await checkToken(returnTo);
  const category = await resolveFixedCategory(id, returnTo);
  if (!category) notFound();
  return <CardWithBackground title={category.name.charAt(0).toUpperCase() + category.name.slice(1)}
    backLink="/" backText="Alle arrangementer" scrollToTopOnMount={false} bare>
    <Suspense fallback={<EventResultsSkeleton />}>
      <HomeOverview searchParams={searchParams} categoryScope={category} returnTo={returnTo} />
    </Suspense>
  </CardWithBackground>;
}