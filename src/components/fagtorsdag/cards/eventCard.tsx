"use client";
import "./eventCard.css";
import { FullDeltaEvent } from "@/types/event";
import { format } from "date-fns";
import { Detail, Heading, Tag } from "@navikt/ds-react";
import {
  CalendarIcon,
  ClockIcon,
  HourglassBottomFilledIcon,
  PersonCheckmarkIcon,
  LocationPinIcon,
} from "@navikt/aksel-icons";
import Link from "next/link";
import {
  formatDeadline,
  formatEventDuration,
  formatEventDates,
  formatEventTimes,
} from "@/service/format";

type EventCardProps = {
  event: FullDeltaEvent;
};

export function EventCard({ event }: EventCardProps) {
  const hasEventExpired =
    !!event.event.signupDeadline && new Date(event.event.signupDeadline) < new Date()
      ? true
      : false;
  const startDay = format(new Date(event.event.startTime), "MMMd");
  const endDay = format(new Date(event.event.endTime), "MMMd");

  return (
    <Link
      href={`/fagtorsdag/${event.event.id}`}
      key={`event-${event.event.id}`}
      className="flex flex-col h-full p-4 border rounded-xl text-text-default border-gray-300 transition-all hover:-translate-y-1 hover:scale-105 hover:text-surface-action-selected-hover hover:border-border-action event-card"
    >
      <Heading level="2" size="small">
        {event.event.title}
      </Heading>

      <div className="flex flex-col gap-2 h-full justify-between">
        <div>
          {startDay === endDay ? (
            <>
              <Detail className="flex gap-1 items-center pb-1 pt-1 leading-normal">
                <CalendarIcon title="dato" />
                {formatEventDates(event.event)}
              </Detail>
              {formatEventDuration(event.event) !== "" && (
                <Detail className="flex gap-1 items-center pb-1 leading-normal">
                  <ClockIcon title="tid" />
                  {`${event.event.startTime.substring(11, 16)} – ${event.event.endTime.substring(
                    11,
                    16,
                  )}`}
                </Detail>
              )}
            </>
          ) : (
            <>
              <Detail className="flex gap-1 items-center pb-1 pt-1 leading-normal">
                <CalendarIcon title="dato" />
                {formatEventTimes(event.event)}
              </Detail>
              {formatEventDuration(event.event) !== "" && (
                <Detail className="flex gap-1 items-center pb-1 leading-normal">
                  <ClockIcon aria-hidden />
                  Varighet: {formatEventDuration(event.event)}
                </Detail>
              )}
            </>
          )}

          {event.event.location.length <= 50 && (
            <Detail className="leading-normal">
              <span className="flex items-center gap-1 pb-1">
                <LocationPinIcon title="lokasjon" />
                {event.event.location}
              </span>
            </Detail>
          )}

          {event.event.signupDeadline && (
            <Detail className="leading-normal">
              <span className="flex items-center gap-1 pb-1">
                <HourglassBottomFilledIcon title="timeglass" />
                Påmeldingsfrist:{" "}
                {hasEventExpired ? (
                  <span className="text-white bg-red-600 rounded px-2">Utløpt</span>
                ) : (
                  formatDeadline(event.event)
                )}
              </span>
            </Detail>
          )}

          {event.event.participantLimit > 0 && (
            <>
              <Detail className="leading-normal">
                <span className="flex items-center gap-1 pb-1 leading-normal">
                  <PersonCheckmarkIcon title="person" />
                  {event.participants.length + event.hosts.length >=
                  event.event.participantLimit ? (
                    <span className="bg-red-600 text-white rounded px-2">
                      Arrangementet er fullt
                    </span>
                  ) : (
                    <>
                      {event.event.participantLimit -
                        event.participants.length -
                        event.hosts.length >
                      9 ? (
                        <>Maks {event.event.participantLimit} deltakere</>
                      ) : (
                        <>
                          Kun{" "}
                          {event.event.participantLimit -
                            event.participants.length -
                            event.hosts.length}{" "}
                          plasser igjen
                        </>
                      )}
                    </>
                  )}
                </span>
              </Detail>
            </>
          )}
        </div>

        <div className="flex gap-2 flex-wrap items-end w-full">
          {event.categories.map((category) => {
            if (category.name !== "fagtorsdag" && category.name !== "mangfold i mai") {
              return (
                  <Tag variant="alt1" size="small" key={category.id}>
                    {category.name}
                  </Tag>
              );
            }
          })}
        </div>
      </div>
    </Link>
  );
}
