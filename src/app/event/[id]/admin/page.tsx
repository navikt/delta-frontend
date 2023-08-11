import { checkToken, getUser } from "@/auth/token";
import CardWithBackground from "@/components/cardWithBackground";
import AdminPage from "./adminPage";
import Link from "next/link";
import { getEvent } from "@/service/eventActions";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Delta Δ - Administrer arrangement",
};

export default async function ParticipantsPage({
  params,
}: {
  params: { id: string };
}) {
  await checkToken(`/event/${params.id}/admin`);

  const fullEvent = await getEvent(params.id);
  const user = getUser();

  if (fullEvent.hosts.some((host) => host.email === user.email)) {
    return (
      <CardWithBackground
        title={`Adminstrer ${fullEvent.event.title}`}
        color="bg-green-200"
        home
        backLink={`/event/${params.id}`}
      >
        <AdminPage fullEvent={fullEvent} user={user} />
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
