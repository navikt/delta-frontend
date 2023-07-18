import type { DeltaEventWithParticipant } from "@/types/event";
import { notFound } from "next/navigation";
import { getAuthlessApi } from "@/api/instance";
import { checkToken, getUser } from "@/auth/token";
import { Heading } from "@navikt/ds-react/esm/typography";
import EventDetails from "./eventDetails";
import { EventCard } from "@/components/eventCard";
import CardWithBackground from "@/components/cardWithBackground";

export default async function Page({ params }: { params: { id: string } }) {
  await checkToken(`/event/${params.id}`);

  const api = getAuthlessApi();
  const response = await api.get(`/event/${params.id}`);
  const user = getUser();

  // Feilhåndtering
  if (response.status === 404) {
    notFound();
  } else if (response.status === 400) {
    return (
      <section className="w-screen flex-grow flex justify-center items-center">
        Uventet feil
      </section>
    );
  } else if (response.status >= 300) {
    return (
      <section className="w-screen flex-grow flex justify-center items-center">
        Uventet feil
      </section>
    );
  }
  const { event, participants }: DeltaEventWithParticipant = response.data;
  return (
    <CardWithBackground color="bg-blue-200" title={event.title}>
      <EventDetails event={event} participants={participants} user={user} />
    </CardWithBackground>
  );
}
