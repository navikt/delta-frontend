import type { DeltaEventWithParticipant } from "@/types/event";
import { notFound } from "next/navigation";
import { getAuthlessApi } from "@/api/instance";
import { checkToken, getUser } from "@/auth/token";
import EventDetails from "./eventDetails";
import CardWithBackground from "@/components/cardWithBackground";

export default async function Page({ params }: { params: { id: string } }) {
  await checkToken(`/event/${params.id}`);

  const api = getAuthlessApi();
  const response = await api.get(`/event/${params.id}`);
  const user = getUser();

  const { event, participants }: DeltaEventWithParticipant = response.data;
  return (
    <CardWithBackground color="bg-blue-200" title={event.title} home>
      <EventDetails event={event} participants={participants} user={user} />
    </CardWithBackground>
  );
}
