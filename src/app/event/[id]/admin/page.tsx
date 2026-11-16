import { checkToken, getUser } from "@/auth/token";
import CardWithBackground from "@/components/cardWithBackground";
import ParticipantPage from "./participantPage";
import Link from "next/link";
import { getEvent } from "@/service/eventQueries";
import { getFeatures } from "@/service/roomQueries";
import { Metadata } from "next";
import { getWaitlistEntries } from "@/service/waitlistQueries";
import WaitlistManager from "@/components/waitlistManager";
import OrganizerBar from "@/components/organizerBar";
import CalendarSyncStatus from "@/components/calendarSyncStatus";
import { RoomStatusRow } from "@/components/roomStatusTag";

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

  const [fullEvent, user, features] = await Promise.all([getEvent(id), getUser(), getFeatures()]);

  if (fullEvent.hosts.some((host) => host.email === user.email)) {
    const waitlistEntries = fullEvent.event.waitlistEnabled ? await getWaitlistEntries(id) : [];
    const { event } = fullEvent;
    const showCalendarStatus = event.inviteMode === "SHARED" && !!event.calendarSyncStatus;
    const showRoomStatus = features.roomBooking && !!event.roomName && !!event.roomStatus;
    return (
      <CardWithBackground
        title={`Deltakerliste: ${fullEvent.event.title}`}
        backText="Arrangementet"
        backLink={`/event/${id}`}
        organizerBar={(showCalendarStatus || showRoomStatus) && (
          <OrganizerBar
            status={<>
              {showCalendarStatus && (
                <CalendarSyncStatus
                  eventId={event.id}
                  status={event.calendarSyncStatus}
                  error={fullEvent.calendarSyncError}
                  isHost
                />
              )}
              {showRoomStatus && <RoomStatusRow eventId={event.id} status={event.roomStatus} />}
            </>}
          />
        )}
      >
        <ParticipantPage
          fullEvent={fullEvent}
          user={user}
          peopleSearchEnabled={features.peopleSearch}
        />
        {fullEvent.event.waitlistEnabled && <WaitlistManager key={JSON.stringify(waitlistEntries)} eventId={id}
          initialEntries={waitlistEntries} />}
      </CardWithBackground>
    );
  } else {
    return (
      <CardWithBackground
        title="Ingen tilgang"
        backText="Arrangementet"
        backLink={`/event/${id}`}
      >
        Du har ikke tilgang til denne siden.
        <Link href={`/event/${id}`}>Tilbake til arrangementet</Link>
      </CardWithBackground>
    );
  }
}
