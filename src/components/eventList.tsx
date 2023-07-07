"use client";

import { DeltaEvent } from "@/types/event";
import { CalendarIcon, ClockIcon, PersonIcon } from "@navikt/aksel-icons";
import { BodyLong, Detail, LinkPanel } from "@navikt/ds-react";
import {
  format,
  formatDuration,
  intervalToDuration,
  parse,
  parseISO,
} from "date-fns";
import { getTimezoneOffset } from "date-fns-tz";
import nb from "date-fns/locale/nb";
import Link from "next/link";

type EventListProps = { events: DeltaEvent[] };

export default function EventList({ events }: EventListProps) {
  const fmt = "do MMMM yyyy, HH:mm";

  const dates = (event: DeltaEvent): [Date, Date] => {
    const offset = getTimezoneOffset("Europe/Oslo");
    var start = parseISO(event.startTime);
    var end = parseISO(event.endTime);
    start.setTime(start.getTime() - offset);
    end.setTime(end.getTime() - offset);
    return [start, end];
  };

  const isSameDay = (start: Date, end: Date): boolean => {
    return format(start, "do MM yyyy") === format(end, "do MM yyyy");
  };

  const formatEventDuration = (event: DeltaEvent): string => {
    const [start, end] = dates(event);

    return formatDuration(intervalToDuration({ start, end }), {
      locale: nb,
      delimiter: ", ",
    });
  };

  const formatEventTimes = (event: DeltaEvent): string => {
    const [start, end] = dates(event);

    return `${format(start, fmt, { locale: nb })} - ${format(
      end,
      isSameDay(start, end) ? "HH:mm" : fmt,
      { locale: nb }
    )}`;
  };

  return (
    <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {events.map((event) => (
        <LinkPanel
          href="#"
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
      ))}
    </section>
  );
}
