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
        {`${format(start, "HH:mm", { locale: nb })} – ${format(end, "HH:mm", {
          locale: nb,
        })}`}
      </span>
      <span className="flex flex-row justify-start gap-2 items-center">
        <PersonCircleIcon />
        {event.ownerEmail}
      </span>
      <span className="flex flex-row justify-start gap-2 items-center">
        <PersonCheckmarkIcon />
        {participants.length}{" "}
        {participants.length == 1 ? "deltaker" : "deltakere"}
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
