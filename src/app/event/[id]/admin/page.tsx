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
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  await checkToken(`/event/${id}/admin`);

  const fullEvent = await getEvent(id);
  const user = await getUser();

  if (fullEvent.hosts.some((host) => host.email === user.email)) {
    return (
      <CardWithBackground
        title={`Deltakerliste: ${fullEvent.event.title}`}
        home
        backText="Arrangementet"
        backLink={`/event/${id}`}
      >
        <ParticipantPage fullEvent={fullEvent} user={user} />
      </CardWithBackground>
    );
  } else {
    return (
      <CardWithBackground
        title="Ingen tilgang"
        color="bg-ax-danger-400"
        backLink={`/event/${id}`}
      >
        Du har ikke tilgang til denne siden.
        <Link href={`/event/${id}`}>Tilbake til arrangementet</Link>
      </CardWithBackground>
    );
  }
}
