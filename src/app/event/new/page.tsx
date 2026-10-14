import { Suspense } from "react";
import { checkToken } from "@/auth/token";
import CreateEventForm from "@/components/createEventForm";
import CardWithBackground from "@/components/cardWithBackground";
import EventResultsSkeleton from "@/components/eventResultsSkeleton";
import { getAllCategories, getEvent } from "@/service/eventQueries";
import { getFeatures } from "@/service/roomQueries";
import type { OverviewSearchParams } from "@/service/overviewState";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Opprett nytt arrangement Δ Delta" };

async function Form({ searchParams }: { searchParams: Promise<OverviewSearchParams> }) {
  await checkToken("/event/new");
  const params = await searchParams;
  const template = Array.isArray(params.template) ? params.template[0] : params.template;
  const [categories, features, source] = await Promise.all([
    getAllCategories("/event/new"), getFeatures(),
    template ? getEvent(template, "/event/new") : undefined,
  ]);
  if (template && !source) throw new Error("Missing event form source");
  return <CreateEventForm initial={source ? { mode: "template", source } : { mode: "new" }}
    allCategories={categories} features={features} />;
}

export default function NewEvent({ searchParams }: { searchParams: Promise<OverviewSearchParams> }) {
  return <CardWithBackground title="Opprett nytt arrangement" home backLink="/">
    <Suspense fallback={<EventResultsSkeleton />}><Form searchParams={searchParams} /></Suspense>
  </CardWithBackground>;
}
