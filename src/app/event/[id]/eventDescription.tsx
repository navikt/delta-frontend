"use client";

import { FullDeltaEvent, DeltaParticipant } from "@/types/event";
import {
  ClockIcon,
  PersonCheckmarkIcon,
  PersonCircleIcon,
  HourglassBottomFilledIcon,
  PinIcon,
} from "@navikt/aksel-icons";
import ParticipantIcon from "@/app/event/[id]/participantIcon";
import { useEffect, useState } from "react";
import { Heading, Link, Modal, Search } from "@navikt/ds-react";
import Participant from "./participant";
import { formatDeadline } from "@/service/format";

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

  useEffect(() => {
    Modal.setAppElement("#main");
  }, []);
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

  return (
    <div className={className || ""}>
      {displayTime && (
        <span className="flex flex-row justify-start gap-2 items-center">
          <ClockIcon aria-label="varighet" />
          {`${event.startTime.substring(11, 16)} – ${event.endTime.substring(
            11,
            16,
          )}`}
        </span>
      )}
      <div>
        {event.location && (
          <span className="flex flex-row justify-start gap-2 items-center">
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
      <div>
        <label className="flex items-center gap-2">
          <PersonCircleIcon aria-hidden />
          Arrangeres av:
        </label>
        <ul>
          {hosts.map((host) => (
            <li className="flex ml-[0.2rem] pl-6 gap-2" key={host.email}>
              <Link
                title={`Send mail til ${host.name}`}
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
          {participants.length}
          {event.participantLimit == 0 ? " " : ` av ${event.participantLimit} `}
          {"deltakere"}
        </span>
        <div className="flex flex-row ml-[0.3rem] pl-6">
          {participants.slice(0, 4).map((p) => (
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
        className="w-4/5 max-w-[30rem] max-h-[50rem]"
        open={openParticipantList}
        onClose={() => setOpenParticipantList(false)}
        aria-labelledby="modal-heading"
        shouldCloseOnEsc={true}
        shouldCloseOnOverlayClick={true}
      >
        <Modal.Content>
          <Heading spacing level="1" size="large" id="modal-heading">
            Deltakere
          </Heading>
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
        </Modal.Content>
      </Modal>
    </div>
  );
}
