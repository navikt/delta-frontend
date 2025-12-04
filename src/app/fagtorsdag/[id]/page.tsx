import type { FullDeltaEvent } from "@/types/event";
import { checkToken, getUser } from "@/auth/token";
import EventDetails from "./eventDetails";
import { getEvent } from "@/service/eventActions";
import { Metadata, ResolvingMetadata } from "next";
import CardWithBackground from "@/components/cardWithBackground";

type EventPageProps = { params: Promise<{ id: string }> };

async function getOptionalEventFromId(id: string) {
  try {
    const { event }: FullDeltaEvent = await getEvent(id);
    return event;
  } catch (e) {
    return null;
  }
}

export async function generateMetadata(
  { params }: EventPageProps,
  parent: ResolvingMetadata,
): Promise<Metadata> {
  const { id } = await params;
  const event = await getOptionalEventFromId(id);
  if (!event) {
    return {
      title: "Delta Δ",
    };
  }

  return {
    title: `${event.title} Δ Delta`,
  };
}

export default async function Page({ params }: EventPageProps) {
  const { id } = await params;
  await checkToken(`/fagtorsdag/${id}`);
  const hostname = process.env.NEXT_PUBLIC_HOSTNAME;

  const user = await getUser();
  const { event, participants, hosts, categories }: FullDeltaEvent = await getEvent(id);

  return (
    <div className="w-full colorful_fagtorsdag pb-10">
      <CardWithBackground
        title={event.title}
        titleColor="#021841"
        home
        backText={"Fagtorsdag"}
        backLink={"/fagtorsdag"}
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
    </div>
  );
}
