"use client";

import {FullDeltaEvent, DeltaParticipant} from "@/types/event";
import {User} from "@/types/user";
import {
    ArrowsCirclepathIcon,
    CalendarIcon,
    HourglassIcon,
    LocationPinIcon,
    PersonIcon,
    VideoIcon,
} from "@navikt/aksel-icons";
import {useMemo, useRef, useState} from "react";
import {BodyShort, Button, Heading, Link, Modal, Search, VStack} from "@navikt/ds-react";
import NextLink from "next/link";
import Participant from "./participant";
import {formatDeadline, formatRecurrenceUntilDate} from "@/service/format";
import {formatEventDateParts} from "@/service/eventDetailsFormat";
import {frequencyLabel} from "@/components/RecurringBadge";
import {DetailsCard, Divider, InfoRow, InfoRows, ParticipantsSummary, SignupOptionsSummary} from "@/components/eventDetailsParts";
import { Features, NO_FEATURES } from "@/types/room";
import { countCapacityAttendees, InvitationCapacity } from "@/service/eventCapacity";

/** Only render server-provided join links that are real https URLs. */
function safeHttpsUrl(url?: string | null): string | null {
    if (!url) return null;
    try {
        return new URL(url).protocol === "https:" ? url : null;
    } catch {
        return null;
    }
}

const displayName = (participant: DeltaParticipant) => participant.name.split(", ").reverse().join(" ");

type EventDescriptionProps = FullDeltaEvent & {
    user: User;
    invitationCapacity: InvitationCapacity;
    /** Room/Teams info is only shown to users with the feature enabled (maintainers during testing). */
    features?: Features;
};

/** Info card: time, place, Teams, deadline, recurrence, organizers and participants. */
export default function EventDescription({
     event,
     participants,
     hosts,
     invitationCapacity,
     recurringSeries,
     user,
     features = NO_FEATURES,
 }: EventDescriptionProps) {
    const [openParticipantList, setOpenParticipantList] = useState(false);
    const [searchInput, setSearchInput] = useState("");
    const participantsAndHosts = participants.concat(hosts);
    const displayedAttendeeCount =
        event.participantLimit === 0
            ? participantsAndHosts.length
            : countCapacityAttendees(
                  participants,
                  hosts,
                  invitationCapacity.reservedInvitations,
                  event.signupDeadline,
              );

    const filterParticipants = useMemo(() => {
        const sortParticipant = (a: DeltaParticipant, b: DeltaParticipant) =>
            a.name.split(", ").reverse()[0] > b.name.split(", ").reverse()[0] ? 1 : -1;

        return [...hosts]
            .sort(sortParticipant)
            .concat([...participants].sort(sortParticipant))
            .filter((p) => {
                return p.name
                    .split(", ")
                    .reverse()
                    .join(" ")
                    .toLowerCase()
                    .includes(searchInput.toLocaleLowerCase());
            });
    }, [hosts, participants, searchInput]);

    const ref = useRef<HTMLDialogElement>(null);
    const isHost = hosts.some((h) => h.email === user.email);
    const participantListAction = isHost ? (
        <Button as={NextLink} href={`/event/${event.id}/admin`} variant="secondary" size="small">
            Vis deltakere
        </Button>
    ) : (
        <Button data-umami-event="deltakerliste åpnet"
            variant="secondary"
            size="small"
            onClick={() => setOpenParticipantList(true)}
        >
            Vis deltakere
        </Button>
    );
    const teamsJoinUrl = safeHttpsUrl(event.teamsJoinUrl);
    const roomName = features.roomBooking ? event.roomName?.trim() : undefined;
    const hasDuplicateRoomAndLocation = !!roomName && roomName === event.location.trim();
    const {date, time} = formatEventDateParts(event);

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
                        <span className="sr-only"> (åpnes i ny fane)</span>
                    </Link>
                );
            }
            return part;
        });
    }

    return (
        <DetailsCard label="Praktisk informasjon">
            <VStack gap="space-24">
                <InfoRows>
                    <InfoRow icon={<CalendarIcon aria-hidden/>}>
                        <BodyShort weight="semibold">{date}</BodyShort>
                        <BodyShort textColor="subtle">{time}</BodyShort>
                    </InfoRow>
                    {roomName ? (
                        <InfoRow icon={<LocationPinIcon aria-hidden/>}>
                            <BodyShort weight="semibold">{roomName}</BodyShort>
                            {event.location && !hasDuplicateRoomAndLocation && (
                                <BodyShort textColor="subtle">{convertTextToLinks(event.location)}</BodyShort>
                            )}
                        </InfoRow>
                    ) : event.location && (
                        <InfoRow icon={<LocationPinIcon aria-hidden/>}>
                            <BodyShort weight="semibold">{convertTextToLinks(event.location)}</BodyShort>
                        </InfoRow>
                    )}
                    {features.teamsMeeting && event.isOnlineMeeting && (
                        <InfoRow icon={<VideoIcon aria-hidden/>}>
                            {teamsJoinUrl ? (
                                <BodyShort>
                                    <Link href={teamsJoinUrl} target="_blank" rel="noopener noreferrer">
                                        Bli med i Teams-møtet
                                        <span className="sr-only"> (åpnes i ny fane)</span>
                                    </Link>
                                </BodyShort>
                            ) : (
                                <BodyShort>Teams-møte – meld deg på for å se lenken</BodyShort>
                            )}
                            {teamsJoinUrl && event.teamsDialIn && (
                                <BodyShort size="small" textColor="subtle">Ring inn: {event.teamsDialIn}</BodyShort>
                            )}
                            {teamsJoinUrl && event.teamsConferenceId && (
                                <BodyShort size="small" textColor="subtle">Konferanse-ID: {event.teamsConferenceId}</BodyShort>
                            )}
                        </InfoRow>
                    )}
                    {event.signupDeadline && (
                        <InfoRow icon={<HourglassIcon aria-hidden/>}>
                            <BodyShort weight="semibold">Påmeldingsfrist</BodyShort>
                            <BodyShort textColor="subtle">{formatDeadline(event)}</BodyShort>
                        </InfoRow>
                    )}
                    {recurringSeries && (
                        <InfoRow icon={<ArrowsCirclepathIcon aria-hidden/>}>
                            <BodyShort weight="semibold">{frequencyLabel(recurringSeries.frequency)}</BodyShort>
                            <BodyShort textColor="subtle">
                                Til {formatRecurrenceUntilDate(recurringSeries.untilDate)}
                            </BodyShort>
                        </InfoRow>
                    )}
                    <InfoRow icon={<PersonIcon aria-hidden/>}>
                        <BodyShort textColor="subtle">Arrangeres av</BodyShort>
                        <ul>
                            {hosts.map((host) => (
                                <li key={host.email}>
                                    <BodyShort>
                                        <Link data-umami-event="kontaker arrangør"
                                            title={`Send e-post til ${displayName(host)}`}
                                            href={`mailto:${host.email}`}
                                        >
                                            {displayName(host)}
                                        </Link>
                                    </BodyShort>
                                </li>
                            ))}
                        </ul>
                    </InfoRow>
                </InfoRows>
                <Divider/>
                {event.signupOptions?.length ? (
                    <SignupOptionsSummary options={event.signupOptions} action={participantListAction} />
                ) : (
                    <ParticipantsSummary
                        attendeeCount={displayedAttendeeCount}
                        participantLimit={event.participantLimit}
                        action={participantListAction}
                    />
                )}
            </VStack>
            <Modal
                open={openParticipantList}
                onClose={() => setOpenParticipantList(false)}
                aria-labelledby="participant-modal-heading"
                ref={ref}
            >
                <Modal.Header>
                    <Heading level="1" size="medium" id="participant-modal-heading">
                        Deltakere
                    </Heading>
                    <form role="search" onSubmit={(e) => e.preventDefault()} className="pt-4 pb-2">
                        <Search
                            label="Søk alle deltakere"
                            variant="simple"
                            size="small"
                            value={searchInput}
                            onChange={(e) => {
                                setSearchInput(e);
                            }}
                        />
                    </form>
                </Modal.Header>
                <Modal.Body>
                    <VStack as="ul" gap="space-16">
                        {filterParticipants.map((p) => (
                            <li key={p.email}>
                                <Participant
                                    {...p}
                                    owner={hosts.some((h) => h.email === p.email)}
                                />
                            </li>
                        ))}
                    </VStack>
                </Modal.Body>
            </Modal>
        </DetailsCard>
    );
}
