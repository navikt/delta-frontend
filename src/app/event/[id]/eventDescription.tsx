"use client";

import {FullDeltaEvent, DeltaParticipant} from "@/types/event";
import {
    ClockIcon,
    CalendarIcon,
    PersonCheckmarkIcon,
    PersonCircleIcon,
    HourglassBottomFilledIcon,
    PinIcon,
} from "@navikt/aksel-icons";
import {useEffect, useRef, useState} from "react";
import {Link, Modal, Search, Button} from "@navikt/ds-react";
import Participant from "./participant";
import {formatEventDates, formatEventTimes, formatDeadline, formatEventDuration} from "@/service/format";

type EventDescriptionProps = FullDeltaEvent & {
    className?: string;
    displayTime: boolean;
};
export default function EventDescription({
         event,
         participants,
         hosts,
         className,
         displayTime,
     }: EventDescriptionProps) {
    const [openParticipantList, setOpenParticipantList] = useState(false);
    const [searchInput, setSearchInput] = useState("");
    const [filterParticipants, setFilterParticipants] = useState<DeltaParticipant[]>([]);
    const participantsAndHosts = participants.concat(hosts);

    const sortParticipant = (a: DeltaParticipant, b: DeltaParticipant) =>
        a.name.split(", ").reverse()[0] > b.name.split(", ").reverse()[0] ? 1 : -1;

    useEffect(() => {
        const filtered = hosts
            .sort(sortParticipant)
            .concat(participants.sort(sortParticipant))
            .filter((p) => {
                return p.name
                    .split(", ")
                    .reverse()
                    .join(" ")
                    .toLowerCase()
                    .includes(searchInput.toLocaleLowerCase());
            });
        setFilterParticipants(filtered);
    }, [participants, searchInput]);

    const ref = useRef<HTMLDialogElement>(null);

    function convertTextToLinks(text: string) {
        const urlRegex = /(https?:\/\/\S+)/g;

        const parts = text.split(urlRegex);
        // @ts-ignore
        return parts.map((part, index) => {
            if (urlRegex.test(part)) {
                let url = part.trim(); // Remove leading/trailing spaces
                if (!url.startsWith('http')) {
                    url = 'https://' + url; // Add 'https://' if it's missing
                }
                return (
                    <Link
                        key={index}
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

    return (
        <div className={className || ""}>
            <div>
                {displayTime ? (
                    <span className="flex flex-row justify-start gap-2 items-center pb-1 pt-1">
            <CalendarIcon aria-label="dato"/>
                        {formatEventDates(event)}
            </span>
                ) : (
                    <span className="flex flex-row justify-start gap-2 items-center pb-1 pt-1">
            <CalendarIcon aria-label="dato"/>
                        {formatEventTimes(event)}
            </span>
                )}
            </div>
            <div>
                {displayTime ? (
                    <span className="flex flex-row justify-start gap-2 items-center pb-1">
          <ClockIcon aria-label="tid"/>
                        {`${event.startTime.substring(11, 16)} – ${event.endTime.substring(
                            11,
                            16,
                        )}`}
          </span>
                ) : (
                    <span className="flex flex-row justify-start gap-2 items-center pb-1">
          <ClockIcon aria-hidden/>
                Varighet: {formatEventDuration(event)}
          </span>
                )}
            </div>
            <div>
                {event.location && (
                    <span className="flex flex-row justify-start gap-2 items-center pb-1">
            <PinIcon aria-label="sted"/>
                        {convertTextToLinks(event.location)}
          </span>
                )}
            </div>
            {event.signupDeadline && (
                <div>
                    <label className="flex items-center gap-2">
                        <HourglassBottomFilledIcon aria-hidden/>
                        Påmeldingsfrist:
                    </label>
                    <span className="flex ml-[0.2rem] pl-6 gap-2 text-red-600">
            {formatDeadline(event)}{" "}
          </span>
                </div>
            )}
            <div className="pb-1">
                <label className="flex items-center gap-2">
                    <PersonCircleIcon aria-hidden/>
                    Arrangeres av:
                </label>
                <ul>
                    {hosts.map((host) => (
                        <li className="flex ml-[0.2rem] pl-6 gap-2" key={host.email}>
                            <Link
                                title={`Send e-post til ${host.name.split(", ").reverse().join(" ")}`}
                                href={`mailto:${host.email}`}
                                className="leading-relaxed"
                            >
                                {host.name.split(", ").reverse().join(" ")}
                            </Link>
                        </li>
                    ))}
                </ul>
            </div>
            <span className="flex flex-row justify-start gap-2 items-center cursor-pointer">
          <PersonCheckmarkIcon aria-hidden/>
                {participantsAndHosts.length}
                {event.participantLimit == 0 ? "" : ` av ${event.participantLimit}`}
                {" deltakere"}
        </span>
            <div className="flex flex-row ml-[0.3rem] pl-6">
                <Button
                    variant="secondary"
                    onClick={() => setOpenParticipantList(true)}
                    className="mb-4"
                    size="small"
                >
                    Vis deltakere
                </Button>
            </div>
            <Modal
                open={openParticipantList}
                onClose={() => setOpenParticipantList(false)}
                aria-labelledby="modal-heading"
                ref={ref}
            >
                <Modal.Header>
                    <h1 className="navds-heading navds-heading--medium">
                        Deltakere
                    </h1>
                    <form>
                        <Search
                            className="pt-4 pb-2"
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
                    <div className="flex flex-col gap-6">
                        <ul className="flex flex-col gap-1">
                            {filterParticipants.map((p) => (
                                <li className="pb-4" key={p.email}>
                                    <Participant
                                        {...p}
                                        owner={hosts.some((h) => h.email === p.email)}
                                    />
                                </li>
                            ))}
                        </ul>
                    </div>
                </Modal.Body>
            </Modal>
        </div>
    );
}
