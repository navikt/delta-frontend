"use client";

import { DeltaEventWithParticipant, DeltaParticipant } from "@/types/event";
import { ClockIcon, PersonCheckmarkIcon, PinIcon } from "@navikt/aksel-icons";
import ParticipantIcon from "@/app/event/[id]/participantIcon";
import { useEffect, useState } from "react";
import { Heading, Modal, Search } from "@navikt/ds-react";
import Participant from "./participant";

type EventDescriptionProps = DeltaEventWithParticipant & { className?: string };
export default function EventDescription({
  event,
  participants,
  className,
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
    const filtered = participants.filter((p) => {
      const name = p.email.split("@")[0].split(".").join(" ");
      return name.toLowerCase().includes(searchInput.toLowerCase());
    });
    setFilterParticipants(filtered);
  }, [participants, searchInput]);

  return (
    <div className={className || ""}>
      <span className="flex flex-row justify-start gap-2 items-center">
        <ClockIcon />
        {`${event.startTime.substring(11, 16)} – ${event.endTime.substring(
          11,
          16,
        )}`}
      </span>
      {event.location && (
        <span className="flex flex-row justify-start gap-2 items-center">
          <PinIcon />
          {event.location}
        </span>
      )}
      <div
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
              nameList={p.email.split("@")[0].split(".")}
              key={p.email}
              type="participantPreview"
            />
          ))}
          {participants.length > 4 && <ParticipantIcon nameList={[]} />}
        </div>
      </div>
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
              <div className="flex flex-col gap-2">
                <div className="flex gap-2 items-center">
                  <ParticipantIcon
                    nameList={event.ownerEmail.split("@")[0].split(".")}
                    type="participantList"
                  ></ParticipantIcon>
                  {event.ownerEmail
                    .split("@")[0]
                    .split(".")
                    .map((name) => name.charAt(0).toUpperCase() + name.slice(1))
                    .join(" ")}{" "}
                  (arrangør)
                </div>
                {filterParticipants
                  .sort((a, b) => (a.email > b.email ? 1 : -1))
                  .map((p) => (
                    <Participant {...p} key={p.email} />
                  ))}
              </div>
            </div>
          </div>
        </Modal.Content>
      </Modal>
    </div>
  );
}
