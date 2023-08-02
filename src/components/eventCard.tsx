"use client";

import { Category, DeltaEvent, FullDeltaEvent } from "@/types/event";
import { Detail, LinkPanel, Tag } from "@navikt/ds-react";
import { CalendarIcon, ClockIcon } from "@navikt/aksel-icons";
import Link from "next/link";
import { formatEventDuration, formatEventTimes } from "@/service/format";

export function EventCard({
  event,
  categories,
}: {
  event: DeltaEvent;
  categories: Category[];
}) {
  return (
    <LinkPanel
      href={`/event/${event.id}`}
      as={Link}
      key={`event-${event.id}`}
      className="transition-all rounded-xl border-gray-300 hover:-translate-y-1 hover:scale-105"
    >
      <LinkPanel.Title>{event.title}</LinkPanel.Title>
      <LinkPanel.Description className="flex flex-col gap-2">
        <div>
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
        </div>
        <div className="flex gap-2 flex-wrap">
          {categories.map((category) => (
            <Tag variant="alt1" key={category.id}>
              {category.name}
            </Tag>
          ))}
        </div>
      </LinkPanel.Description>
    </LinkPanel>
  );
}
