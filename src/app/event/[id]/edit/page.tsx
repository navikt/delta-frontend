import CardWithBackground from "@/components/cardWithBackground";
import CreateEventForm from "@/components/createEventForm";
import { getEvent } from "@/service/eventActions";

export default async function EditEvent({
  params,
}: {
  params: { id: string };
}) {
  const { event } = await getEvent(params.id);
  return (
    <CardWithBackground title="Rediger arrangement" color="bg-green-200" home>
      <CreateEventForm event={event} />
    </CardWithBackground>
  );
}
