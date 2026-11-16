"use client";

import {useState, useTransition, type ReactNode} from "react";
import {User} from "@/types/user";
import EventDescription from "./eventDescription";
import {
    Button,
    Heading,
    HGrid,
    InlineMessage,
    Link,
    Modal,
    BodyLong,
    LocalAlert,
    VStack,
} from "@navikt/ds-react";
import NextLink from "next/link";
import {FullDeltaEvent} from "@/types/event";
import type { getEventRegistrationState } from "@/service/eventInteractiveReads";
import { changeEventRegistration } from "@/service/waitlistActions";
import Calendar from "@/components/calendar";
import CardWithBackground from "@/components/cardWithBackground";
import {
    countCapacityAttendees,
    InvitationCapacity,
    isInvitationReservationActive,
} from "@/service/eventCapacity";
import CalendarSyncStatus from "@/components/calendarSyncStatus";
import OrganizerBar from "@/components/organizerBar";
import { DescriptionCard, EventHeroMeta } from "@/components/eventDetailsParts";
import { type FestivalConfig, getFestivalEventUrl } from "../festivals";
import WaitlistControls from "@/components/waitlistControls";
import RegistrationRefreshNotice from "@/components/registrationRefreshNotice";
import type { WaitlistState } from "@/types/event";

export default function EventDetails({
     festival,
     event,
     participants,
     hosts,
     categories,
     invitationCapacity,
     calendarSyncError,
     user,
     hostname,
     waitlist,
 }: FullDeltaEvent & {
    festival: FestivalConfig;
    invitationCapacity: InvitationCapacity;
    user: User;
    hostname?: string;
    waitlist?: WaitlistState;
}) {
    const eventUrl = getFestivalEventUrl(festival, event.id, hostname);
    const [reactiveParticipants, setParticipants] = useState(participants);
    const [reactiveWaitlist, setWaitlist] = useState(waitlist);
    const [registrationPending, startRegistration] = useTransition();
    const [registrationError, setRegistrationError] = useState("");
    const [registrationNeedsRefresh, setRegistrationNeedsRefresh] = useState(false);
    const updateRegistration = (updated: Awaited<ReturnType<typeof getEventRegistrationState>> | null) => {
        setRegistrationNeedsRefresh(updated === null);
        if (updated === null) return;
        setParticipants(updated.participants);
        setInvitationCapacity(updated.invitationCapacity);
        setWaitlist(updated.waitlist);
    };
    const [reactiveInvitationCapacity, setInvitationCapacity] = useState(invitationCapacity);
    const isHost = hosts.some((host) => host.email === user.email);
    const isParticipant = reactiveWaitlist?.registered || reactiveParticipants
        .map((p) => p.email)
        .includes(user.email);
    const hasInvitationReservation = isInvitationReservationActive(
        reactiveInvitationCapacity.hasOwnReservation,
        event.signupDeadline,
    );
    const attendeeCount = countCapacityAttendees(
        reactiveParticipants,
        hosts,
        reactiveInvitationCapacity.reservedInvitations,
        event.signupDeadline,
    );

    const [showRegistration, setRegistration] = useState(false);
    const [showUnregistration, setUnregistration] = useState(false);
    const [openConfirmation, setOpenConfirmation] = useState(false);
    const [openInterested, setOpenInterested] = useState(false);

    const showAlert = () => {
        setUnregistration(false)
        setRegistration(false)
        const setter = !isParticipant ? setRegistration : setUnregistration;
        setter(true);
    };

    const hasEnded = new Date(event.endTime) < new Date();
    const showCalendarStatus = event.inviteMode === "SHARED" && !!event.calendarSyncStatus;

    function convertTextToLinks(text: string) {
        const urlRegex = /(https?:\/\/\S+)/g;

        const parts = text.split(urlRegex);
        const linkOccurrences = new Map<string, number>();
        return parts.map((part) => {
            if (part.startsWith("http://") || part.startsWith("https://")) {
                let url = part.trim(); // Remove leading/trailing spaces
                if (!url.startsWith('http')) {
                    url = 'https://' + url; // Add 'https://' if it's missing
                }
                const occurrence = linkOccurrences.get(url) ?? 0;
                linkOccurrences.set(url, occurrence + 1);
                return (
                    <Link
                        key={`${url}-${occurrence}`}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        {url}
                    </Link>
                );
            }
            return part;
        });
    }

    const meldInteresseButton = (
        <Button
            variant="primary"
            onClick={() => setOpenInterested((x) => !x)}
        >
            Meld interesse
        </Button>
    );

    /** Organizer actions, shown in the organizer bar above the hero. */
    const organizerActions = isHost && (
        <Button as={NextLink} href={`/event/${event.id}/admin`} variant="primary">
            Administrer
        </Button>
    );

    /** Hero actions and the status message that explains them, derived from the registration state. */
    const registration: { actions?: ReactNode; notice?: ReactNode } = (function () {
        if (registrationNeedsRefresh) {
            return { notice: <RegistrationRefreshNotice eventId={event.id} onUpdated={updateRegistration} /> };
        }
        if (isHost) return {};
        if (!isParticipant && reactiveWaitlist?.position != null) {
            return { actions: <WaitlistControls eventId={event.id} state={reactiveWaitlist} onUpdated={updateRegistration} /> };
        }
        if (hasEnded)
            return {
                notice: <InlineMessage status="info">Arrangementet er avsluttet</InlineMessage>,
                actions: isParticipant && (
                    <Button
                        variant="primary"
                        data-color="danger"
                        onClick={() => setOpenConfirmation((x) => !x)}
                    >
                        Slett deltakelse
                    </Button>
                ),
            };
        const isUtløpt =
            !isParticipant &&
            !!event.signupDeadline &&
            new Date(event.signupDeadline) < new Date();
        if (isUtløpt) {
            return {
                notice: <InlineMessage status="warning">Påmeldingsfristen er utløpt</InlineMessage>,
                actions: meldInteresseButton,
            };
        }
        if (
            !isParticipant && !hasInvitationReservation && event.participantLimit > attendeeCount &&
            reactiveWaitlist?.enabled && reactiveWaitlist.open && reactiveWaitlist.count > 0
        ) {
            return { actions: <WaitlistControls eventId={event.id} state={reactiveWaitlist} onUpdated={updateRegistration} /> };
        }
        if (
            event.participantLimit &&
            event.participantLimit <= attendeeCount &&
            !isParticipant &&
            !hasInvitationReservation
        ) {
            return {
                notice: <InlineMessage status="warning">Arrangementet er fullt</InlineMessage>,
                actions: reactiveWaitlist?.enabled && reactiveWaitlist.open
                    ? <WaitlistControls eventId={event.id} state={reactiveWaitlist} onUpdated={updateRegistration} />
                    : meldInteresseButton,
            };
        }
        return {
            actions: (
                <Button
                    variant="primary"
                    data-color={isParticipant ? "danger" : undefined}
                    onClick={() => setOpenConfirmation((x) => !x)}
                >
                    {isParticipant ? "Meld av" : "Bli med"}
                </Button>
            ),
        };
    })();

    const hasNotices = showRegistration || showUnregistration || !!registration.notice;

    return (
        <CardWithBackground
            title={event.title}
            backLink={`/${festival.slug}`}
            backText={festival.backText}
            backToOverview
            leading={<Calendar dateString={event.startTime}/>}
            meta={<EventHeroMeta event={event} categories={categories}/>}
            actions={registration.actions || undefined}
            organizerBar={isHost && (
                <OrganizerBar
                    status={showCalendarStatus && (
                        <CalendarSyncStatus
                            eventId={event.id}
                            status={event.calendarSyncStatus}
                            error={calendarSyncError}
                            isHost={isHost}
                        />
                    )}
                    actions={organizerActions}
                />
            )}
            bare
        >
            <VStack gap="space-24">
                {hasNotices && (
                    <VStack gap="space-8">
                        {showRegistration && (
                            <InlineMessage status="success" role="status">
                                Påmelding registrert
                            </InlineMessage>
                        )}
                        {showUnregistration && (
                            <InlineMessage status="success" role="status">
                                {hasEnded ? "Deltakelse slettet" : "Avmelding registrert"}
                            </InlineMessage>
                        )}
                        {registration.notice}
                    </VStack>
                )}
                <HGrid gap="space-24" columns={{ xs: 1, md: "minmax(0, 24rem) minmax(0, 1fr)" }} align="start">
                    <VStack gap="space-16">
                        <EventDescription
                            contact={festival.contact}
                            user={user}
                            event={event}
                            participants={reactiveParticipants}
                            hosts={hosts}
                            invitationCapacity={reactiveInvitationCapacity}
                            categories={categories}
                        />
                    </VStack>
                    <DescriptionCard shareUrl={eventUrl} qrText={eventUrl}>
                        <BodyLong className="whitespace-pre-line">
                            {convertTextToLinks(event.description)}
                        </BodyLong>
                    </DescriptionCard>
                </HGrid>
            </VStack>
            <Modal
                open={openInterested}
                onClose={() => setOpenInterested(false)}
                aria-label="Meld interesse"
            >
                <Modal.Body>
                    <Heading spacing level="1" size="large" id="modal-heading">
                        Meld interesse
                    </Heading>
                    <BodyLong spacing>Arrangementet er dessverre fullt, men det er mulig at
                        arrangøren har en venteliste eller planer om lignende arrangementer.</BodyLong>
                    <BodyLong spacing>Meld interesse til arrangøren:</BodyLong>
                    <ul className="list-disc list-inside">
                        {hosts.map((host) => (
                            <li key={host.email}>
                                <Link
                                    title={`Send e-post til ${host.name.split(", ").reverse().join(" ")}`}
                                    href={`mailto:${host.email}`}
                                >
                                    {host.name.split(", ").reverse().join(" ")}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </Modal.Body>
                <Modal.Footer>
                    <Button
                        variant="secondary"
                        onClick={async () => setOpenInterested((x) => !x)}
                    >
                        Lukk
                    </Button>
                </Modal.Footer>
            </Modal>
            <Modal
                open={openConfirmation}
                onClose={() => { if (!registrationPending) setOpenConfirmation(false); }}
                aria-label="Meld av modal"
            >
                <Modal.Body>
                    {registrationError && <LocalAlert status="error" role="alert">
                        <LocalAlert.Content>{registrationError}</LocalAlert.Content>
                    </LocalAlert>}
                    {registrationError && <Button variant="secondary" onClick={() => window.location.reload()}>Oppdater siden</Button>}
                    <Heading spacing level="1" size="large" id="modal-heading">
                        {isParticipant ? <>{hasEnded ? "Slett min deltakelse" : "Meld av"}</> : "Bli med"}
                    </Heading>
                    <BodyLong spacing>
                        {isParticipant
                            ? hasEnded
                                ? "Ønsker du å slette deltakelsen din? Hvis ja sletter Delta data lagret om deg knyttet til dette arrangementet."
                                : "Er du sikker på at du vil melde deg av? Dersom påmeldingsfristen er utløpt eller antallsbegrensing er nådd, kan du ikke melde deg på igjen."
                            : "Ved å melde deg på arrangementet, godtar du at Delta lagrer ditt navn og din e-postadresse."}
                    </BodyLong>
                </Modal.Body>
                <Modal.Footer>
                    <Button
                        variant="secondary"
                        onClick={async () => setOpenConfirmation((x) => !x)}
                    >
                        Avbryt
                    </Button>
                    <Button
                        variant="primary"
                        data-color={isParticipant ? "danger" : undefined}
                        loading={registrationPending}
                        disabled={registrationNeedsRefresh}
                        onClick={() => startRegistration(async () => {
                            const result = await changeEventRegistration(event.id, isParticipant);
                            if (!result.ok) {
                                setRegistrationError(result.message);
                                return;
                            }
                            setRegistrationError("");
                            showAlert();
                            updateRegistration(result.refreshRequired ? null : result.data);
                            setOpenConfirmation(false);
                        })}
                    >
                        {isParticipant ? <>{hasEnded ? "Ja, slett meg" : "Ja, meld meg av"}</> : "Godta og bli med"}
                    </Button>
                </Modal.Footer>
            </Modal>
        </CardWithBackground>
    );
}
