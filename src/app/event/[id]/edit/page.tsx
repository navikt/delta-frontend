import CardWithBackground from "@/components/cardWithBackground";
import CreateEventForm from "@/components/createEventForm";

export default async function EditEvent({
  params,
}: {
  params: { id: string };
}) {
  return (
    <CardWithBackground
      title="Rediger arrangement"
      color="bg-green-200"
      home
      backLink={`/event/${params.id}/admin`}
    >
      <CreateEventForm eventId={params.id} />
    </CardWithBackground>
  );
}
