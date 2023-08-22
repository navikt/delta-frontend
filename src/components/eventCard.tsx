"use client";

import "./eventCard.css";
import { Category, DeltaEvent } from "@/types/event";
import { Detail, Heading, LinkPanel, Tag } from "@navikt/ds-react";
import {
  CalendarIcon,
  ClockIcon,
  HourglassBottomFilledIcon,
  PersonCheckmarkIcon,
} from "@navikt/aksel-icons";
import Link from "next/link";
import {
  formatDeadline,
  formatEventDuration,
  formatEventTimes,
} from "@/service/format";

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
    <Link
      href={`/event/${event.id}`}
      key={`event-${event.id}`}
      className="flex flex-col h-full p-4 border rounded-xl text-text-default border-gray-300 transition-all hover:-translate-y-1 hover:scale-105 hover:text-surface-action-selected-hover hover:border-border-action event-card"
    >
      <Heading size="small">{event.title}</Heading>
      <div className="flex flex-col gap-2 h-full justify-between">
        <div>
          <Detail className="flex gap-1 items-center">
            <CalendarIcon title="kalender" />
            {formatEventTimes(event)}
          </Detail>
          {formatEventDuration(event) !== "" && (
            <Detail className="flex gap-1 items-center">
              <ClockIcon title="klokke" />
              {formatEventDuration(event)}
            </Detail>
          )}
          <Detail>
            {event.signupDeadline && (
              <span className="flex items-center gap-1">
                <HourglassBottomFilledIcon title="timeglass" />
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
          <Detail>
            {event.participantLimit > 0 && (
                <>
                  <span className="flex items-center gap-1">
                    <PersonCheckmarkIcon title="person" />
                    Antallsbegrensning: {event.participantLimit} personer
                  </span>
                </>
            )
            }
          </Detail>
        </div>
        <div className="flex gap-2 flex-wrap h-full items-end w-full">
          {categories.map((category) => (
            <Tag variant="alt1" key={category.id}>
              {category.name}
            </Tag>
          ))}
        </div>
      </div>
    </Link>
  );
}
