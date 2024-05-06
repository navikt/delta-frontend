import type { FullDeltaEvent } from "@/types/event";
import { checkToken, getUser } from "@/auth/token";
import EventDetails from "./eventDetails";
import { getEvent } from "@/service/eventActions";
import { Metadata, ResolvingMetadata } from "next";
import CardWithBackground from "@/components/cardWithBackground";

type EventPageProps = { params: { id: string } };

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
  const event = await getOptionalEventFromId(params.id);
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
  await checkToken(`/mim/${params.id}`);
  const hostname = process.env.NEXT_PUBLIC_HOSTNAME;

  const user = getUser();
  const { event, participants, hosts, categories }: FullDeltaEvent = await getEvent(params.id);

  return (
    <div className="w-full colorful pb-10">
      <CardWithBackground
        title={event.title}
        titleColor="#021841"
        home
        backText={"MIM24"}
        backLink={"/mim"}
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
