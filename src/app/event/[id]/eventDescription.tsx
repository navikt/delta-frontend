"use client";

import { dates } from "@/components/format";
import { DeltaEventWithParticipant } from "@/types/event";
import {
  ClockIcon,
  PersonCheckmarkIcon,
  PersonCircleIcon,
  PinIcon,
} from "@navikt/aksel-icons";
import { format } from "date-fns";
import { nb } from "date-fns/locale";
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
  const [start, end] = dates(event);
  return (
    <div className={className || ""}>
      <span className="flex flex-row justify-start gap-2 items-center">
        <ClockIcon />
        {`${format(start, "HH:mm", { locale: nb })} – ${format(end, "HH:mm", {
          locale: nb,
        })}`}
      </span>
      <span className="flex flex-row justify-start gap-2 items-center">
        <PersonCircleIcon />
        {event.ownerEmail}
      </span>
      <div
        onClick={() => setOpenParticipantList(!openParticipantList)}
        className="fle flex-col hover:bg-surface-subtle rounded-md cursor-pointer"
      >
        <span className="flex flex-row justify-start gap-2 items-center cursor-pointer">
          <PersonCheckmarkIcon />
          {participants.length}{" "}
          {participants.length == 1 ? "deltaker" : "deltakere"}
        </span>
        <div className="flex flex-row">
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
