import CardWithBackground from "@/components/cardWithBackground";
import CreateEventForm from "@/components/createEventForm";
import { getAllCategories } from "@/service/eventActions";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Delta Δ - Rediger arrangement"
}

export default async function EditEvent({
  params,
}: {
  params: { id: string };
}) {
  const categories = await getAllCategories();
  return (
    <CardWithBackground
      title="Rediger arrangement"
      color="bg-green-200"
      home
      backLink={`/event/${params.id}/admin`}
    >
      <CreateEventForm eventId={params.id} allCategories={categories} />
    </CardWithBackground>
  );
}
