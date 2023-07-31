import type { FullDeltaEvent } from "@/types/event";
import { notFound } from "next/navigation";
import { checkToken, getUser } from "@/auth/token";
import EventDetails from "./eventDetails";
import CardWithBackground from "@/components/cardWithBackground";
import { getEvent } from "@/service/eventActions";

export default async function Page({ params }: { params: { id: string } }) {
  await checkToken(`/event/${params.id}`);
  const hostname = process.env.NEXT_PUBLIC_HOSTNAME;

  const user = getUser();
  const { event, participants, hosts }: FullDeltaEvent = await getEvent(
    params.id,
  );

  return (
    <CardWithBackground
      color="bg-blue-200"
      title={event.title}
      home
      backLink="/"
    >
      <EventDetails
        event={event}
        participants={participants}
        hosts={hosts}
        user={user}
        hostname={hostname}
      />
    </CardWithBackground>
  );
}
