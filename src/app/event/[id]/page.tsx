import type { FullDeltaEvent } from "@/types/event";
import { checkToken, getUser } from "@/auth/token";
import EventDetails from "./eventDetails";
import CardWithBackground from "@/components/cardWithBackground";
import { getEvent } from "@/service/eventQueries";
import { ApiError } from "@/service/eventListTransport";
import { getFeatures } from "@/service/roomQueries";
import { getInvitationCapacity } from "@/service/eventCapacity";
import { safeReturnTo } from "@/service/returnTo";
import type { Metadata } from "next";

type EventPageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ returnTo?: string | string[] }>;
};

async function getOptionalEventFromId(id: string) {
  try {
    const { event }: FullDeltaEvent = await getEvent(id);
    return event;
  } catch (e) {
    if (!(e instanceof ApiError)) throw e;
    return null;
  }
}

export async function generateMetadata(
  { params }: EventPageProps,
): Promise<Metadata> {
  const { id } = await params;
  const event = await getOptionalEventFromId(id);
  if (!event) {
    return {
      title: "Delta Δ"
    };
  }

  return {
    title: `${event.title} Δ Delta`,
  };
}

export default async function Page({ params, searchParams }: EventPageProps) {
  const { id } = await params;
  const { returnTo } = await searchParams;
  await checkToken(`/event/${id}`);
  const hostname = process.env.NEXT_PUBLIC_HOSTNAME;
  const backLink = safeReturnTo(returnTo, "/");

  const [user, fullEvent, features] = await Promise.all([getUser(), getEvent(id), getFeatures()]);
  const {
    event,
    participants,
    hosts,
    categories,
    recurringSeries,
    invited = [],
    calendarSyncError,
  }: FullDeltaEvent = fullEvent;
  const isHost = hosts.some((host) => host.email.toLowerCase() === user.email.toLowerCase());
  const invitationCapacity = getInvitationCapacity(
    participants,
    hosts,
    invited,
    user.email,
    event.signupDeadline,
  );

  return (
    <CardWithBackground
      title={event.title}
      home
      backText="Arrangementer"
      backLink={backLink}
    >
      <EventDetails
        event={event}
        participants={participants}
        hosts={hosts}
        categories={categories}
        invitationCapacity={invitationCapacity}
        calendarSyncError={isHost ? calendarSyncError : null}
        recurringSeries={recurringSeries}
        user={user}
        hostname={hostname}
        features={features}
      />
    </CardWithBackground>
  );
}
