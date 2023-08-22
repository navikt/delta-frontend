"use client";

import "./eventCard.css";
import { Category, FullDeltaEvent } from "@/types/event";
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
  event: FullDeltaEvent;
  categories: Category[];
}) {
  const isUtløpt =
    !!event.event.signupDeadline &&
    new Date(event.event.signupDeadline) < new Date()
      ? true
      : false;
  return (
    <Link
      href={`/event/${event.event.id}`}
      key={`event-${event.event.id}`}
      className="flex flex-col h-full p-4 border rounded-xl text-text-default border-gray-300 transition-all hover:-translate-y-1 hover:scale-105 hover:text-surface-action-selected-hover hover:border-border-action event-card"
    >
      <Heading size="small">{event.event.title}</Heading>
      <div className="flex flex-col gap-2 h-full justify-between">
        <div>
          <Detail className="flex gap-1 items-center">
            <CalendarIcon title="kalender" />
            {formatEventTimes(event.event)}
          </Detail>
          {formatEventDuration(event.event) !== "" && (
            <Detail className="flex gap-1 items-center">
              <ClockIcon title="klokke" />
              {formatEventDuration(event.event)}
            </Detail>
          )}
          <Detail>
            {event.event.signupDeadline && (
              <span className="flex items-center gap-1">
                <HourglassBottomFilledIcon title="timeglass" />
                Påmeldingsfrist:{" "}
                {isUtløpt ? (
                  <span className="text-white bg-red-600 rounded px-2">
                    Utløpt
                  </span>
                ) : (
                  formatDeadline(event.event)
                )}
              </span>
            )}
          </Detail>
          <Detail>
            {event.event.participantLimit > 0 && (
              <>
                <span className="flex items-center gap-1">
                  <PersonCheckmarkIcon title="person" />
                  {event.participants.length + event.hosts.length}/
                  {event.event.participantLimit}
                  {event.participants.length + event.hosts.length >=
                    event.event.participantLimit && (
                    <span className="bg-red-600 text-white rounded px-2">
                      Fullt
                    </span>
                  )}
                </span>
              </>
            )}
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
