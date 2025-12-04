import { checkToken, getUser } from "@/auth/token";
import CardWithBackground from "@/components/cardWithBackground";
import ParticipantPage from "./participantPage";
import Link from "next/link";
import { getEvent } from "@/service/eventActions";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Administrer arrangement Δ Delta",
};

export default async function ParticipantsPage({
  params,
}: {
  params: { id: string };
}) {
  await checkToken(`/event/${params.id}/admin`);

  const fullEvent = await getEvent(params.id);
  const user = await getUser();

  if (fullEvent.hosts.some((host) => host.email === user.email)) {
    return (
      <CardWithBackground
        title={`Deltakerliste: ${fullEvent.event.title}`}
        home
        backText="Arrangementet"
        backLink={`/event/${params.id}`}
      >
        <ParticipantPage fullEvent={fullEvent} user={user} />
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
