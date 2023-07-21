"use client";

import { DeltaEventWithParticipant } from "@/types/event";
import {
  ClockIcon,
  PersonCheckmarkIcon,
  PersonCircleIcon,
  PinIcon,
} from "@navikt/aksel-icons";
import ParticipantList from "@/app/event/[id]/participantList";
import ParticipantIcon from "@/app/event/[id]/participantIcon";
import { useState } from "react";

type EventDescriptionProps = DeltaEventWithParticipant & { className?: string };
export default function EventDescription({
  event,
  participants,
  className,
}: EventDescriptionProps) {
  const [openParticipantList, setOpenParticipantList] = useState(false);
  console.log();

  return (
    <div className={className || ""}>
      <span className="flex flex-row justify-start gap-2 items-center">
        <ClockIcon />
        {`${event.startTime.substring(11, 16)} – ${event.endTime.substring(
          11,
          16,
        )}`}
      </span>
      <span className="flex flex-row justify-start gap-2 items-center">
        <PersonCircleIcon />
        {event.ownerEmail}
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
        <ParticipantList
          participants={participants}
          open={openParticipantList}
          setOpen={setOpenParticipantList}
        />
      </div>
      {event.location && (
        <span className="flex flex-row justify-start gap-2 items-center">
          <PinIcon />
          {event.location}
        </span>
      )}
    </div>
  );
}
