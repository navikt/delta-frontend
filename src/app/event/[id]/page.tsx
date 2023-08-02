import type { FullDeltaEvent } from "@/types/event";
import { checkToken, getUser } from "@/auth/token";
import EventDetails from "./eventDetails";
import CardWithBackground from "@/components/cardWithBackground";
import { getEvent } from "@/service/eventActions";
import { Metadata, ResolvingMetadata } from "next";

type EventPageProps = { params: { id: string } };

export async function generateMetadata(
  { params }: EventPageProps,
  parent: ResolvingMetadata,
): Promise<Metadata> {
  const { event }: FullDeltaEvent = await getEvent(params.id);

  return {
    title: `Delta Δ - ${event.title}`,
  };
}

export default async function Page({ params }: EventPageProps) {
  await checkToken(`/event/${params.id}`);
  const hostname = process.env.NEXT_PUBLIC_HOSTNAME;

  const user = getUser();
  const { event, participants, hosts, categories }: FullDeltaEvent =
    await getEvent(params.id);

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
        categories={categories}
        user={user}
        hostname={hostname}
      />
    </CardWithBackground>
  );
}
