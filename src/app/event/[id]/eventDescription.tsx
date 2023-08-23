"use client";

import { FullDeltaEvent, DeltaParticipant } from "@/types/event";
import {
  ClockIcon,
  CalendarIcon,
  PersonCheckmarkIcon,
  PersonCircleIcon,
  HourglassBottomFilledIcon,
  PinIcon,
} from "@navikt/aksel-icons";
import ParticipantIcon from "@/app/event/[id]/participantIcon";
import { useEffect, useRef, useState } from "react";
import { Heading, Link, Modal, Search } from "@navikt/ds-react";
import Participant from "./participant";
import { formatEventDates, formatDeadline } from "@/service/format";

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
  const [filterParticipants, setFilterParticipants] = useState<
    DeltaParticipant[]
  >([]);
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

  return (
    <div className={className || ""}>
      <div>
        {displayTime && (
            <span className="flex flex-row justify-start gap-2 items-center pb-1 pt-1">
            <CalendarIcon aria-label="dato"/>
              {formatEventDates(event)}
            </span>
        )}
      </div>
      <div>
        {displayTime && (
          <span className="flex flex-row justify-start gap-2 items-center pb-1">
          <ClockIcon aria-label="tid" />
        {`${event.startTime.substring(11, 16)} – ${event.endTime.substring(
          11,
          16,
          )}`}
          </span>
        )}
      </div>
      <div>
        {event.location && (
          <span className="flex flex-row justify-start gap-2 items-center pb-1">
            <PinIcon aria-label="lokasjon" />
            {event.location}
          </span>
        )}
      </div>
      {event.signupDeadline && (
        <div>
          <label className="flex items-center gap-2">
            <HourglassBottomFilledIcon aria-hidden />
            Påmeldingsfrist:
          </label>
          <span className="flex ml-[0.2rem] pl-6 gap-2 text-red-600">
            {formatDeadline(event)}{" "}
          </span>
        </div>
      )}
      <div className="pb-1">
        <label className="flex items-center gap-2">
          <PersonCircleIcon aria-hidden />
          Arrangeres av:
        </label>
        <ul>
          {hosts.map((host) => (
            <li className="flex ml-[0.2rem] pl-6 gap-2" key={host.email}>
              <Link
                title={`Send e-post til ${host.name}`}
                href={`mailto:${host.email}`}
              >
                {host.name}
              </Link>
            </li>
          ))}
        </ul>
      </div>
      <button
        onClick={() => setOpenParticipantList(true)}
        className="flex flex-col hover:bg-surface-subtle rounded-md cursor-pointer"
      >
        <span className="flex flex-row justify-start gap-2 items-center cursor-pointer">
          <PersonCheckmarkIcon />
          {participantsAndHosts.length}
          {event.participantLimit == 0 ? "" : ` av ${event.participantLimit}`}
          {" deltakere"}
        </span>
        <div className="flex flex-row ml-[0.3rem] pl-6">
          {participantsAndHosts.slice(0, 4).map((p) => (
            <ParticipantIcon
              name={p.name}
              key={p.email}
              type="participantPreview"
            />
          ))}
          {participants.length > 4 && <ParticipantIcon name={""} />}
        </div>
      </button>
      <Modal
        open={openParticipantList}
        onClose={() => setOpenParticipantList(false)}
        aria-labelledby="modal-heading"
        ref={ref} header={{ heading: "Deltakere" }}
      >
        <Modal.Body>
          <div className="flex flex-col gap-6">
            <form>
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
            <ul className="flex flex-col gap-1">
              {filterParticipants.map((p) => (
                <li key={p.email}>
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
