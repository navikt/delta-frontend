"use client";

import {useState, useTransition, type ReactNode} from "react";
import {User} from "@/types/user";
import EventDescription from "./eventDescription";
import {
    Button,
    HGrid,
    InlineMessage,
    Link,
    Modal,
    BodyLong,
    LocalAlert,
    VStack,
} from "@navikt/ds-react";
import NextLink from "next/link";
import {FullDeltaEvent, EditScope} from "@/types/event";
import {deleteEvent} from "@/service/eventActions";
import type { getEventRegistrationState } from "@/service/eventInteractiveReads";
import { changeEventRegistration } from "@/service/waitlistActions";
import MarkdownRenderer from "@/components/MarkdownRenderer";
import Calendar from "@/components/calendar";
import CardWithBackground from "@/components/cardWithBackground";
import {TrashIcon, PencilIcon, BarChartIcon, FilesIcon} from "@navikt/aksel-icons";
import EditScopeModal from "@/components/editScopeModal";
import { Features } from "@/types/room";
import {
    countCapacityAttendees,
    InvitationCapacity,
    isInvitationReservationActive,
} from "@/service/eventCapacity";
import CalendarSyncStatus from "@/components/calendarSyncStatus";
import OrganizerBar from "@/components/organizerBar";
import { RoomStatusRow } from "@/components/roomStatusTag";
import { DescriptionCard, EventHeroMeta } from "@/components/eventDetailsParts";
import WaitlistControls from "@/components/waitlistControls";
import RegistrationRefreshNotice from "@/components/registrationRefreshNotice";
import type { WaitlistState } from "@/types/event";

export default function EventDetails({
     event,
     participants,
     hosts,
     categories,
     recurringSeries,
     invitationCapacity,
     calendarSyncError,
     user,
     hostname,
     features,
     waitlist,
 }: FullDeltaEvent & {
    invitationCapacity: InvitationCapacity;
    user: User;
    hostname?: string;
    features?: Features;
    waitlist?: WaitlistState;
}) {
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
    const [openConfirmationDelete, setOpenConfirmationDelete] = useState(false);
    const [openScopeDelete, setOpenScopeDelete] = useState(false);
    const [openInterested, setOpenInterested] = useState(false);

    const showAlert = () => {
        setUnregistration(false)
        setRegistration(false)
        const setter = !isParticipant ? setRegistration : setUnregistration;
        setter(true);
    };

    const hasEnded = new Date(event.endTime) < new Date();
    const showCalendarStatus = event.inviteMode === "SHARED" && !!event.calendarSyncStatus;
    const showRoomStatus = !!features?.roomBooking && !!event.roomName && !!event.roomStatus;

    const meldInteresseButton = (
        <Button data-umami-event="melder interesse"
            variant="primary"
            onClick={() => setOpenInterested((x) => !x)}
        >
            Meld interesse
        </Button>
    );

    /** Organizer actions, shown in the organizer bar above the hero. */
    const organizerActions = isHost && (
        <>
            <Button data-umami-event="administrer besøkt"
                as={NextLink}
                href={`/event/${event.id}/edit`}
                variant="primary"
                icon={<PencilIcon aria-hidden/>}
            >
                Rediger
            </Button>
            <Button data-umami-event="bruk som mal"
                as={NextLink}
                href={`/event/new?template=${event.id}`}
                variant="secondary"
                icon={<FilesIcon aria-hidden/>}
            >
                Dupliser
            </Button>
            <Button data-umami-event="webtatistikk besøkt"
                as="a"
                href={`https://metabase.ansatt.nav.no/dashboard/716-nav-webstatistikk?dato=past30days~&nettside=delta.nav.no&url-sti_er_lik=%2Fevent%2F${event.id}`}
                variant="secondary"
                icon={<BarChartIcon aria-hidden/>}
            >
                Statistikk
            </Button>
            <Button
                type="button"
                variant="tertiary"
                data-color="danger"
                icon={<TrashIcon aria-hidden/>}
                onClick={() => {
                    if (recurringSeries) {
                        setOpenScopeDelete(true);
                    } else {
                        setOpenConfirmationDelete((x) => !x);
                    }
                }}
            >
                Slett
            </Button>
        </>
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
                    <Button data-umami-event="sletter deltakelse"
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
                <Button data-umami-event={isParticipant ? "avmeldingmodal åpnet" : "påmeldingmodal åpnet"}
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
            backLink="/"
            backText="Alle arrangementer"
            backToOverview
            leading={<Calendar dateString={event.startTime}/>}
            meta={<EventHeroMeta event={event} categories={categories} recurringSeries={recurringSeries}/>}
            actions={registration.actions || undefined}
            organizerBar={isHost && (
                <OrganizerBar
                    status={<>
                        {showCalendarStatus && (
                            <CalendarSyncStatus
                                eventId={event.id}
                                status={event.calendarSyncStatus}
                                error={calendarSyncError}
                                isHost={isHost}
                            />
                        )}
                        {showRoomStatus && <RoomStatusRow eventId={event.id} status={event.roomStatus}/>}
                    </>}
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
                            user={user}
                            event={event}
                            participants={reactiveParticipants}
                            hosts={hosts}
                            invitationCapacity={reactiveInvitationCapacity}
                            categories={categories}
                            recurringSeries={recurringSeries}
                            features={features}
                        />
                    </VStack>
                    <DescriptionCard
                        shareUrl={`${hostname}/event/${event.id}`}
                        qrText={`https://delta.nav.no/event/${event.id}`}
                        trackEvents
                    >
                        <MarkdownRenderer>{event.description}</MarkdownRenderer>
                    </DescriptionCard>
                </HGrid>
            </VStack>
            <Modal
                open={openInterested}
                onClose={() => setOpenInterested(false)}
                header={{ heading: "Meld interesse" }}
            >
                <Modal.Body>
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
                    <Button data-umami-event="modal lukket"
                        variant="secondary"
                        onClick={async () => setOpenInterested((x) => !x)}
                    >
                        Lukk
                    </Button>
                </Modal.Footer>
            </Modal>
            <Modal
                open={openConfirmationDelete}
                onClose={() => setOpenConfirmationDelete(false)}
                header={{ heading: `Slett «${event.title}»?` }}
                width="small"
            >
                <Modal.Body>
                    <BodyLong spacing>
                        {`Er du sikker på at du vil slette "${event?.title}"? Alle deltakere og påmeldte vil også bli slettet. Dette kan ikke angres.`}
                    </BodyLong>
                </Modal.Body>
                <Modal.Footer>
                    <Button
                        variant="secondary"
                        onClick={async () => setOpenConfirmationDelete((x) => !x)}
                    >
                        Avbryt
                    </Button>
                    <Button
                        variant="primary"
                        data-color="danger"
                        onClick={() => deleteAndRedirect(event.id)}
                    >
                        Ja, jeg vil slette arrangementet
                    </Button>
                </Modal.Footer>
            </Modal>
            {recurringSeries && (
                <EditScopeModal
                    open={openScopeDelete}
                    onClose={() => setOpenScopeDelete(false)}
                    onConfirm={async (scope) => {
                        setOpenScopeDelete(false);
                        await deleteAndRedirect(event.id, scope);
                    }}
                    title={`Slett gjentakende arrangement`}
                    description={`Vil du slette kun dette arrangementet, eller dette og alle fremtidige i serien?`}
                    confirmLabel="Slett"
                    confirmVariant="danger"
                    availableScopes={recurringSeries.editableScopes}
                />
            )}
            <Modal
                open={openConfirmation}
                onClose={() => { if (!registrationPending) setOpenConfirmation(false); }}
                header={{ heading: isParticipant ? (hasEnded ? "Slett min deltakelse" : "Meld av") : "Bli med" }}
            >
                <Modal.Body>
                    {registrationError && <LocalAlert status="error" role="alert">
                        <LocalAlert.Content>{registrationError}</LocalAlert.Content>
                    </LocalAlert>}
                    {registrationError && <Button variant="secondary" onClick={() => window.location.reload()}>Oppdater siden</Button>}
                    <BodyLong spacing>
                        {isParticipant
                            ? hasEnded
                                ? "Ønsker du å slette deltakelsen din? Hvis ja sletter Delta data lagret om deg knyttet til dette arrangementet."
                                : "Er du sikker på at du vil melde deg av? Dersom påmeldingsfristen er utløpt eller antallsbegrensing er nådd, kan du ikke melde deg på igjen."
                            : "Ved å melde deg på arrangementet, godtar du at Delta lagrer ditt navn og din e-postadresse."}
                    </BodyLong>
                </Modal.Body>
                <Modal.Footer>
                    <Button data-umami-event={isParticipant ? "avbryter avmelding" : "avbryter påmelding"}
                        variant="secondary"
                        onClick={async () => setOpenConfirmation((x) => !x)}
                    >
                        Avbryt
                    </Button>
                    <Button data-umami-event={isParticipant ? "avmelding" : "påmelding"}
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

async function deleteAndRedirect(eventId: string, editScope?: EditScope) {
    await deleteEvent(eventId, editScope);
    window.location.href = "/";
}
