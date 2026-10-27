import "server-only";
import type { Metadata } from "next";
import { checkToken, getUser } from "@/auth/token";
import CardWithBackground from "@/components/cardWithBackground";
import { getInvitationCapacity } from "@/service/eventCapacity";
import { ApiError } from "@/service/eventListTransport";
import { getEvent } from "@/service/eventQueries";
import { type FestivalConfig, getFestivalEventPath } from "../festivals";
import EventDetails from "./eventDetails";

export type FestivalEventPageProps = {
  params: Promise<{ id: string }>;
};

export async function generateFestivalMetadata(
  festival: FestivalConfig,
  { params }: FestivalEventPageProps,
): Promise<Metadata> {
  const { id } = await params;
  try {
    const { event } = await getEvent(id, getFestivalEventPath(festival, id));
    return { title: `${event.title} Δ Delta` };
  } catch (error) {
    if (!(error instanceof ApiError)) throw error;
    return { title: "Delta Δ" };
  }
}

export default async function FestivalEventPage({
  festival,
  params,
}: FestivalEventPageProps & { festival: FestivalConfig }) {
  const { id } = await params;
  const eventPath = getFestivalEventPath(festival, id);
  await checkToken(eventPath);
  const user = await getUser();
  const { event, participants, hosts, categories, invited = [], calendarSyncError } =
    await getEvent(id, eventPath);
  const isHost = hosts.some((host) => host.email.toLowerCase() === user.email.toLowerCase());
  const invitationCapacity = getInvitationCapacity(
    participants,
    hosts,
    invited,
    user.email,
    event.signupDeadline,
  );

  return (
    <div className={`w-full ${festival.bgClass} pb-10`}>
      <CardWithBackground
        title={event.title}
        titleColor={festival.titleColor}
        className="bg-fagfestival"
        home
        backText={festival.backText}
        backLink={`/${festival.slug}`}
        backToOverview
      >
        <EventDetails
          festival={festival}
          event={event}
          participants={participants}
          hosts={hosts}
          categories={categories}
          invitationCapacity={invitationCapacity}
          calendarSyncError={isHost ? calendarSyncError : null}
          user={user}
          hostname={process.env.NEXT_PUBLIC_HOSTNAME}
        />
      </CardWithBackground>
    </div>
  );
}
