import type { FullDeltaEvent } from "@/types/event";
import { checkToken, getUser } from "@/auth/token";
import EventDetails from "./eventDetails";
import { getEvent } from "@/service/eventActions";
import { Metadata, ResolvingMetadata } from "next";
import CardWithBackground from "@/components/cardWithBackground";
import { getInvitationCapacity } from "@/service/eventCapacity";

type EventPageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ returnTo?: string | string[] }>;
};

function normalizeSearchParamValue(value?: string | string[]) {
  return Array.isArray(value) ? value[0] : value;
}

function getSafeReturnTo(returnTo?: string | string[]) {
  const normalizedReturnTo = normalizeSearchParamValue(returnTo);

  if (
    !normalizedReturnTo ||
    !normalizedReturnTo.startsWith("/") ||
    normalizedReturnTo.startsWith("//")
  ) {
    return "/mim";
  }

  return normalizedReturnTo;
}

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

export default async function Page({ params, searchParams }: EventPageProps) {
  const { id } = await params;
  const { returnTo } = await searchParams;
  await checkToken(`/mim/${id}`);
  const hostname = process.env.NEXT_PUBLIC_HOSTNAME;
  const backLink = getSafeReturnTo(returnTo);

  const user = await getUser();
  const { event, participants, hosts, categories, invited = [], calendarSyncError }: FullDeltaEvent =
    await getEvent(id);
  const isHost = hosts.some((host) => host.email.toLowerCase() === user.email.toLowerCase());
  const invitationCapacity = getInvitationCapacity(
    participants,
    hosts,
    invited,
    user.email,
    event.signupDeadline,
  );

  return (
    <div className="w-full colorful pb-10">
      <CardWithBackground
        title={event.title}
        titleColor="#021841"
        className="bg-fagfestival"
        home
        backText={"Arrangementer"}
        backLink={backLink}
      >
        <EventDetails
          event={event}
          participants={participants}
          hosts={hosts}
          categories={categories}
          invitationCapacity={invitationCapacity}
          calendarSyncError={isHost ? calendarSyncError : null}
          user={user}
          hostname={hostname}
        />
      </CardWithBackground>
    </div>
  );
}
