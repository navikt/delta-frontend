import { checkToken, getUser } from "@/auth/token";
import CardWithBackground from "@/components/cardWithBackground";
import { DeltaEventWithParticipant } from "@/types/event";
import AdminPage from "./adminPage";
import Link from "next/link";
import { getEvent } from "@/service/eventActions";

export default async function ParticipantsPage({
  params,
}: {
  params: { id: string };
}) {
  await checkToken(`/event/${params.id}/participants`);

  const event = await getEvent(params.id);
  const user = getUser();

  if (user.email === event.event.ownerEmail) {
    return (
      <CardWithBackground
        title={`Adminstrer ${event.event.title}`}
        color="bg-green-200"
        home
        backLink={`/event/${params.id}`}
      >
        <AdminPage eventWithParticipants={event} />
      </CardWithBackground>
    );
  } else {
    return (
      <CardWithBackground
        title="Ingen tilgang"
        color="bg-red-300"
        backLink={`/event/${params.id}`}
      >
        Du har ikke tilgang til denne siden.
        <Link href={`/event/${params.id}`}>Tilbake til arrangementet</Link>
      </CardWithBackground>
    );
  }
}
