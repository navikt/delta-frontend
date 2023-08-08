"use client";

import "./eventCard.css";
import { Category, DeltaEvent } from "@/types/event";
import { Detail, LinkPanel, Tag } from "@navikt/ds-react";
import {
  CalendarIcon,
  ClockIcon,
  HourglassBottomFilledIcon,
} from "@navikt/aksel-icons";
import Link from "next/link";
import {
  formatDeadline,
  formatEventDuration,
  formatEventTimes,
} from "@/service/format";
import { format } from "path";

export function EventCard({
  event,
  categories,
}: {
  event: DeltaEvent;
  categories: Category[];
}) {
  const isUtløpt =
    !!event.signupDeadline && new Date(event.signupDeadline) < new Date()
      ? true
      : false;
  return (
    <LinkPanel
      href={`/event/${event.id}`}
      as={Link}
      key={`event-${event.id}`}
      className="transition-all rounded-xl border-gray-300 hover:-translate-y-1 hover:scale-105 h-full event-card"
    >
      <LinkPanel.Title>{event.title}</LinkPanel.Title>
      <LinkPanel.Description className="flex flex-col gap-2 flex-grow w-full justify-between">
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
          <Detail>
            {event.signupDeadline && (
              <span className="flex items-center gap-1">
                <HourglassBottomFilledIcon />
                Påmeldingsfrist:{" "}
                {isUtløpt ? (
                  <span className="text-white bg-red-600 rounded px-2">
                    Utløpt
                  </span>
                ) : (
                  formatDeadline(event)
                )}
              </span>
            )}
          </Detail>
        </div>
        <div className="flex gap-2 flex-wrap items-end w-full">
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
