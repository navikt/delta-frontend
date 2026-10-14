import { Suspense } from "react";
import { checkToken } from "@/auth/token";
import CardWithBackground from "@/components/cardWithBackground";
import CreateEventForm from "@/components/createEventForm";
import EventResultsSkeleton from "@/components/eventResultsSkeleton";
import { getAllCategories, getEvent } from "@/service/eventQueries";
import { getFeatures } from "@/service/roomQueries";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Rediger arrangement Δ Delta" };

async function Form({ id }: { id: string }) {
  const returnTo = `/event/${id}/edit`;
  await checkToken(returnTo);
  const [categories, features, source] = await Promise.all([
    getAllCategories(returnTo), getFeatures(), getEvent(id, returnTo),
  ]);
  return <CreateEventForm initial={{ mode: "edit", source }} allCategories={categories} features={features} />;
}

export default async function EditEvent({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <CardWithBackground title="Rediger arrangement" home backLink={`/event/${id}/admin`}>
    <Suspense fallback={<EventResultsSkeleton />}><Form id={id} /></Suspense>
  </CardWithBackground>;
}
