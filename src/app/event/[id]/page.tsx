import type { DeltaEventWithParticipant } from "@/types/event";
import { getAuthlessApi } from "@/api/instance";
import { checkToken, getUser } from "@/auth/token";
import EventDetails from "./eventDetails";
import CardWithBackground from "@/components/cardWithBackground";
import { getEvent } from "@/service/eventActions";

export default async function Page({ params }: { params: { id: string } }) {
  await checkToken(`/event/${params.id}`);
  const user = getUser();

  const { event, participants } = await getEvent(params.id);
  return (
    <CardWithBackground color="bg-blue-200" title={event.title} home>
      <EventDetails event={event} participants={participants} user={user} />
    </CardWithBackground>
  );
}
