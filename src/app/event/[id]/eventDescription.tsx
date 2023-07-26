"use client";

import { DeltaEventWithParticipant } from "@/types/event";
import {
  ClockIcon,
  PersonCheckmarkIcon,
  PersonCircleIcon,
  PinIcon,
} from "@navikt/aksel-icons";
import ParticipantIcon from "@/app/event/[id]/participantIcon";
import { useEffect, useState } from "react";
import { Heading, Modal } from "@navikt/ds-react";
import Participant from "./participant";
import Link from "next/link";

type EventDescriptionProps = DeltaEventWithParticipant & { className?: string };
export default function EventDescription({
  event,
  participants,
  className,
}: EventDescriptionProps) {
  const [openParticipantList, setOpenParticipantList] = useState(false);
  useEffect(() => {
    Modal.setAppElement("#main");
  }, []);

  return (
    <div className={className || ""}>
      <span className="flex flex-row justify-start gap-2 items-center">
        <ClockIcon />
        {`${event.startTime.substring(11, 16)} – ${event.endTime.substring(
          11,
          16
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
