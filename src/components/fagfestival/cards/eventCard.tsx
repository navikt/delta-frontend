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
  formatEventTimeRangeOrComingSoon,
  formatEventTimes,
} from "@/service/format";

type EventCardProps = {
  event: FullDeltaEvent;
  returnTo: string;
  isJoined?: boolean;
  slug?: string;
};

export function EventCard({ event, returnTo, isJoined = false, slug = "fagfest" }: EventCardProps) {
  const hasEventExpired =
    !!event.event.signupDeadline && new Date(event.event.signupDeadline) < new Date()
      ? true
      : false;
  const startDay = format(new Date(event.event.startTime), "MMMd");
  const endDay = format(new Date(event.event.endTime), "MMMd");

  const href = `/${slug}/${event.event.id}?returnTo=${encodeURIComponent(returnTo)}`;

  const handleNavigation = () => {
    sessionStorage.setItem(`event-overview-scroll:${returnTo}`, `${window.scrollY}`);
  };

  return (
    <Link
      href={href}
      onClick={handleNavigation}
      key={`event-${event.event.id}`}
      className="flex flex-col h-full p-4 border rounded-xl text-ax-text-neutral border-ax-neutral-400 transition-all hover:-translate-y-1 hover:scale-105 hover:text-ax-text-action hover:border-ax-border-accent no-underline event-card"
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
                  {formatEventTimeRangeOrComingSoon(event.event)}
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
                  <span className="text-white bg-ax-danger-700 rounded px-2">Utløpt</span>
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
                    <span className="bg-ax-danger-700 text-white rounded px-2">
                      Arrangementet er fullt
                    </span>
                  ) : (
                    <>
                      {event.event.participantLimit -
                        event.participants.length -
                        event.hosts.length >
                      9 ? (
                        <>{event.participants.length} / {event.event.participantLimit} deltakere</>
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
          {event.event.participantLimit === 0 && (
            <Detail className="leading-normal">
              <span className="flex items-center gap-1 pb-1 leading-normal">
                <PersonCheckmarkIcon title="deltakere" />
                {event.participants.length} {event.participants.length === 1 ? "deltaker" : "deltakere"}
              </span>
            </Detail>
          )}
        </div>

        <div className="flex gap-2 flex-wrap items-end w-full">
          {isJoined && (
            <Tag variant="success" size="small">
              Påmeldt
            </Tag>
          )}
          {event.categories.map((category) => {
            const normalizedCategoryName = category.name.toLowerCase().trim();
            const shouldHideMimAttendanceTag =
              slug === "mim" &&
              (normalizedCategoryName === "fysisk" || normalizedCategoryName === "digitalt");

            if (
              category.name !== slug &&
              normalizedCategoryName !== "påmeldt" &&
              !shouldHideMimAttendanceTag
            ) {
              return (
                <Tag variant="neutral" size="small" key={category.id}>
                  {category.name}
                </Tag>
              );
            }

            return null;
          })}
        </div>
      </div>
    </Link>
  );
}
