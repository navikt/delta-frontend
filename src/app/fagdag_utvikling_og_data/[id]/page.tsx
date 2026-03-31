import type { FullDeltaEvent } from "@/types/event";
import { getUser } from "@/auth/token";
import FestivalEventDetails from "@/components/festival/festivalEventDetails";
import { fagdagUtviklingOgDataConfig } from "@/components/festival/festivalConfig";
import { getEvent } from "@/service/eventQueries";
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
    return { title: "Delta Δ" };
  }
  return { title: `${event.title} Δ Delta` };
}

export default async function Page({ params }: EventPageProps) {
  const { id } = await params;
  const config = fagdagUtviklingOgDataConfig;
  const hostname = process.env.NEXT_PUBLIC_HOSTNAME;
  const user = await getUser();
  const { event, participants, hosts, categories }: FullDeltaEvent =
    await getEvent(id);

  return (
    <div className={`w-full ${config.cssClass} pb-10`}>
      <CardWithBackground
        title={event.title}
        titleColor="#021841"
        home
        backText={config.backText}
        backLink={`/${config.basePath}`}
      >
        <FestivalEventDetails
          event={event}
          participants={participants}
          hosts={hosts}
          categories={categories}
          user={user}
          hostname={hostname}
          basePath={config.basePath}
          contactName={config.organizerName}
          contactEmail={config.organizerEmail}
        />
      </CardWithBackground>
    </div>
  );
}
