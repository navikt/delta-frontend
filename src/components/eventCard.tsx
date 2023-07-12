"use client";

import { DeltaEvent } from "@/types/event";
import { BodyLong, Detail, LinkPanel } from "@navikt/ds-react";
import { CalendarIcon, ClockIcon, PersonIcon } from "@navikt/aksel-icons";
import Link from "next/link";
import { formatEventDuration, formatEventTimes } from "./format";

type EventCardProps = { event: DeltaEvent };

export function EventCard({ event }: EventCardProps) {
  return (
    <LinkPanel
      href={`/event/${event.id}`}
      as={Link}
      key={`event-${event.id}`}
      className="transition-all rounded hover:-translate-y-1 hover:scale-105"
    >
      <LinkPanel.Title>{event.title}</LinkPanel.Title>
      <LinkPanel.Description>
        <Detail className="flex gap-1 items-center">
          <CalendarIcon />
          {formatEventTimes(event)}
        </Detail>
        {formatEventDuration(event) !== "" && (
          <Detail className="flex gap-1 items-center">
            <ClockIcon />
            {formatEventDuration(event)}
          </Detail>
        )}
        <BodyLong>{event.description}</BodyLong>
      </LinkPanel.Description>
    </LinkPanel>
  );
}
