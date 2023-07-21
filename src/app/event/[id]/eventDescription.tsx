"use client";

import { DeltaEventWithParticipant } from "@/types/event";
import {
  ClockIcon,
  PersonCheckmarkIcon,
  PersonCircleIcon,
  PinIcon,
} from "@navikt/aksel-icons";
import ParticipantIcon from "@/app/event/[id]/participantIcon";
import { useState } from "react";
import { Heading, Modal } from "@navikt/ds-react";
import Participant from "./participant";
import { formatDeadline } from "@/service/format";
import Link from "next/link";
import ExportParticipants from "./exportParticipants";

type EventDescriptionProps = DeltaEventWithParticipant & { className?: string };
export default function EventDescription({
  event,
  participants,
  className,
}: EventDescriptionProps) {
  const [openParticipantList, setOpenParticipantList] = useState(false);

  return (
    <div className={className || ""}>
      <span className="flex flex-row justify-start gap-2 items-center">
        <ClockIcon />
        {`${event.startTime.substring(11, 16)} – ${event.endTime.substring(
          11,
          16
        )}`}
      </span>
      <span className="flex flex-row justify-start gap-2 items-center">
        <PersonCircleIcon />
        <Link href={`mailto:${event.ownerEmail}`}>{event.ownerEmail}</Link>
      </span>
      <div
        onClick={() => setOpenParticipantList(true)}
        className="flex flex-col hover:bg-surface-subtle rounded-md cursor-pointer"
      >
        <span className="flex flex-row justify-start gap-2 items-center cursor-pointer">
          <PersonCheckmarkIcon />
          {participants.length}{" "}
          {participants.length == 1 ? "deltaker" : "deltakere"}
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
      {event.location && (
        <span className="flex flex-row justify-start gap-2 items-center">
          <PinIcon />
          {event.location}
        </span>
      )}
      <div>Påmeldingsfrist: {formatDeadline(event)}</div>
      <Modal
        className="w-4/5 max-w-[30rem] max-h-[50rem]"
        open={openParticipantList}
        aria-label="deltakere"
        onClose={() => setOpenParticipantList(false)}
        aria-labelledby="modal-heading"
        shouldCloseOnEsc={true}
        shouldCloseOnOverlayClick={true}
      >
        <Modal.Content>
          <Heading spacing level="1" size="large" id="modal-heading">
            Deltakere
          </Heading>
          <ExportParticipants participants={participants} />
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              {participants.map((p) => (
                <Participant {...p} key={p.email} />
              ))}
            </div>
            <div></div>
          </div>
        </Modal.Content>
      </Modal>
    </div>
  );
}
