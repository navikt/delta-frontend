"use client";

import { FullDeltaEvent, DeltaParticipant } from "@/types/event";
import {
  ClockIcon,
  PersonCheckmarkIcon,
  PersonCircleIcon,
  PinIcon,
} from "@navikt/aksel-icons";
import ParticipantIcon from "@/app/event/[id]/participantIcon";
import { useEffect, useState } from "react";
import { Heading, Link, Modal, Search } from "@navikt/ds-react";
import Participant from "./participant";

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

  useEffect(() => {
    const filtered = hosts
      .sort((a, b) => (a.email > b.email ? 1 : -1))
      .concat(participants.sort((a, b) => (a.email > b.email ? 1 : -1)))
      .filter((p) => {
        return p.name.split(", ").reverse().join(" ").includes(searchInput);
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
      {event.location && (
        <span className="flex flex-row justify-start gap-2 items-center">
          <PinIcon aria-label="lokasjon" />
          {event.location}
        </span>
      )}
      <ul>
        <span className="flex items-center gap-2">
          <PersonCircleIcon />
          Arrangeres av:
        </span>
        {hosts.map((host) => (
          <li className="flex ml-[0.2rem] pl-6 gap-2" key={host.email}>
            <Link href={`mailto:${host.email}`}>{host.name}</Link>
          </li>
        ))}
      </ul>
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
            <div className="flex flex-col gap-6">
              <ul className="flex flex-col gap-2">
                <li>
                  {filterParticipants.map((p) => (
                    <Participant
                      {...p}
                      owner={hosts.some((h) => h.email === p.email)}
                      key={p.email}
                    />
                  ))}
                </li>
              </ul>
            </div>
          </div>
        </Modal.Content>
      </Modal>
    </div>
  );
}
