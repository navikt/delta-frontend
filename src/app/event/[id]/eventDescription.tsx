"use client";

import { dates, formatEventDuration } from "@/components/format";
import { DeltaEvent, DeltaEventWithParticipant } from "@/types/event";
import {
  ClockIcon,
  PersonCheckmarkIcon,
  PersonCircleIcon,
  PinIcon,
} from "@navikt/aksel-icons";

type EventDescriptionProps = DeltaEventWithParticipant & { className?: string };
export default function EventDescription({
  event,
  participants,
  className,
}: EventDescriptionProps) {
  const [start, end] = dates(event);
  return (
    <div className={className || ""}>
      <span className="flex flex-row justify-start gap-2 items-center">
        <ClockIcon />
        {formatEventDuration(event)}
      </span>
      <span className="flex flex-row justify-start gap-2 items-center">
        <PersonCircleIcon />
        {event.ownerEmail}
      </span>
      <span className="flex flex-row justify-start gap-2 items-center">
        <PersonCheckmarkIcon />
        {participants.length} deltakere
      </span>
      {event.location && (
        <span className="flex flex-row justify-start gap-2 items-center">
          <PinIcon />
          {event.location}
        </span>
      )}
    </div>
  );
}
