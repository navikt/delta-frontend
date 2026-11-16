"use client";
import { FullDeltaEvent } from "@/types/event";
import { format } from "date-fns";
import { Detail, LinkCard, Tag } from "@navikt/ds-react";
import {
  CalendarIcon,
  ClockIcon,
  HourglassBottomFilledIcon,
  PersonCheckmarkIcon,
  LocationPinIcon,
} from "@navikt/aksel-icons";
import {
  formatDeadline,
  formatEventDuration,
  formatEventDates,
  formatEventTimeRangeOrComingSoon,
  formatEventTimes,
} from "@/service/format";
import { countCapacityAttendees } from "@/service/eventCapacity";
import { rememberOverviewReturn } from "@/components/overviewReturn";

type EventCardProps = {
  event: FullDeltaEvent;
  returnTo: string;
  isJoined?: boolean;
  slug?: string;
};

export function EventCard({ event, returnTo, isJoined = false, slug = "fagfest" }: EventCardProps) {
  const attendeeCount = countCapacityAttendees(
    event.participants,
    event.hosts,
    event.invited,
    event.event.signupDeadline,
  );
  const hasEventExpired =
    !!event.event.signupDeadline && new Date(event.event.signupDeadline) < new Date()
      ? true
      : false;
  const startDay = format(new Date(event.event.startTime), "MMMd");
  const endDay = format(new Date(event.event.endTime), "MMMd");

  const href = `/${slug}/${event.event.id}`;

  const handleNavigation = () => {
    sessionStorage.setItem(`event-overview-scroll:${returnTo}`, `${window.scrollY}`);
    rememberOverviewReturn(href, returnTo);
  };

  return (
    <LinkCard arrow={false} size="small" className="h-full">
      <LinkCard.Title as="h2">
        <LinkCard.Anchor href={href} onClick={handleNavigation}>
          {event.event.title}
        </LinkCard.Anchor>
      </LinkCard.Title>

      <LinkCard.Description>
          {startDay === endDay ? (
            <>
              <Detail className="flex gap-1 items-center pb-1 pt-1 leading-normal">
                <CalendarIcon aria-hidden />
                {formatEventDates(event.event)}
              </Detail>
              {formatEventDuration(event.event) !== "" && (
                <Detail className="flex gap-1 items-center pb-1 leading-normal">
                  <ClockIcon aria-hidden />
                  {formatEventTimeRangeOrComingSoon(event.event)}
                </Detail>
              )}
            </>
          ) : (
            <>
              <Detail className="flex gap-1 items-center pb-1 pt-1 leading-normal">
                <CalendarIcon aria-hidden />
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
                <LocationPinIcon aria-hidden />
                {event.event.location}
              </span>
            </Detail>
          )}

          {event.event.signupDeadline && (
            <Detail className="leading-normal">
              <span className="flex items-center gap-1 pb-1">
                <HourglassBottomFilledIcon aria-hidden />
                Påmeldingsfrist:{" "}
                {hasEventExpired ? (
                  <Tag size="small" variant="strong" data-color="danger">Utløpt</Tag>
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
                  <PersonCheckmarkIcon aria-hidden />
                  {attendeeCount >= event.event.participantLimit ? (
                    <Tag size="small" variant="strong" data-color="danger">
                      Arrangementet er fullt
                    </Tag>
                  ) : (
                    <>
                      {event.event.participantLimit - attendeeCount > 9 ? (
                        <>{attendeeCount} / {event.event.participantLimit} plasser</>
                      ) : (
                        <>
                          Kun{" "}
                          {event.event.participantLimit - attendeeCount}{" "}
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
                <PersonCheckmarkIcon aria-hidden />
                {event.participants.length} {event.participants.length === 1 ? "deltaker" : "deltakere"}
              </span>
            </Detail>
          )}
      </LinkCard.Description>

      <LinkCard.Footer>
          {isJoined && (
            <Tag variant="moderate" data-color="success" size="small">
              Påmeldt
            </Tag>
          )}
          {event.event.waitlistEnabled && event.event.participantLimit > 0 && (
            <Tag variant="outline" data-color="info" size="small">Venteliste</Tag>
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
                <Tag variant="outline" data-color="neutral" size="small" key={category.id}>
                  {category.name}
                </Tag>
              );
            }

            return null;
          })}
      </LinkCard.Footer>
    </LinkCard>
  );
}
