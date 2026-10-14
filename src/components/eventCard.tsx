"use client";
import "./eventCard.css";
import {Category, FullDeltaEvent} from "@/types/event";
import {format} from "date-fns";
import {Detail, Heading, Skeleton, Tag} from "@navikt/ds-react";
import {
    CalendarIcon,
    ClockIcon,
    HourglassBottomFilledIcon,
    PersonCheckmarkIcon,
    LocationPinIcon,
    ArrowCirclepathIcon,
} from "@navikt/aksel-icons";
import Link from "next/link";
import {
    formatDeadline,
    formatEventDuration,
    formatEventDates,
    formatEventTimes,
} from "@/service/format";
import { countCapacityAttendees } from "@/service/eventCapacity";
import { RecurringBadge } from "@/components/RecurringBadge";
import { useOverviewPath } from "@/components/useOverviewPath";
import { shouldHideEventCard } from "@/components/eventCardVisibility";
import { useBrowserNow } from "@/components/useBrowserNow";

export function EventCard({
                              event,
                              categories,
                              showAll,
                              tabname,
                              userEmail,
                              showOnlyRegistered,
                           }: {
    event: FullDeltaEvent;
    categories: Category[];
    showAll?: string[];
    tabname?: string;
    userEmail?: string;
    showOnlyRegistered?: boolean;
}) {
    const now = useBrowserNow();
    const attendeeCount = countCapacityAttendees(
        event.participants,
        event.hosts,
        event.invited,
        event.event.signupDeadline,
        new Date(now ?? 0),
    );
    const isRegistered =
        userEmail != null && event.participants.some((p) => p.email === userEmail);
    const isUtløpt =
        now !== null &&
        !!event.event.signupDeadline &&
        new Date(event.event.signupDeadline).getTime() < now;
    const returnTo = useOverviewPath();

    const shouldHide = shouldHideEventCard({
        tabname,
        categories: event.categories,
        signupDeadlineExpired: isUtløpt,
        showPast: showAll?.includes("10") ?? false,
        showOnlyRegistered,
    });

    if (shouldHide) return null;
    if (now === null && event.event.signupDeadline && tabname === "alle" && !showOnlyRegistered) {
        return <Skeleton variant="rounded" className="h-72 w-full" />;
    }
    const href = `/event/${event.event.id}?returnTo=${encodeURIComponent(returnTo)}`;

    const handleNavigation = () => {
        sessionStorage.setItem(`event-overview-scroll:${returnTo}`, `${window.scrollY}`);
    };

    return (
                <Link
                    href={href}
                    prefetch={false}
                    onClick={handleNavigation}
                    className="flex flex-col h-full p-4 border rounded-xl text-ax-text-neutral border-ax-neutral-400 transition-all hover:-translate-y-1 hover:scale-105 hover:text-ax-text-action hover:border-ax-border-accent no-underline event-card"
                >
                    <Heading level="2" size="small">
                        {event.recurringSeries && (
                            <ArrowCirclepathIcon
                                title="Gjentakende arrangement"
                                className="inline-block mr-1 align-text-bottom"
                                fontSize="1.2em"
                            />
                        )}
                        {event.event.title}
                    </Heading>
                    <div className="flex flex-col gap-2 h-full justify-between">
                        <div>
                            {now === null ? <Skeleton variant="text" className="w-full" /> :
                            format(new Date(event.event.startTime), "MMMd") ===
                            format(new Date(event.event.endTime), "MMMd") ? (
                                <><Detail className="flex gap-1 items-center pb-1 pt-1 leading-normal">
                                    <CalendarIcon title="dato"/>
                                    {formatEventDates(event.event)}
                                </Detail>
                                    {formatEventDuration(event.event) !== "" && (
                                        <Detail className="flex gap-1 items-center pb-1 leading-normal">
                                            <ClockIcon title="tid"/>
                                            {`${event.event.startTime.substring(11, 16)} – ${event.event.endTime.substring(
                                                11,
                                                16,
                                            )}`}
                                        </Detail>
                                    )}</>) : (
                                <><Detail className="flex gap-1 items-center pb-1 pt-1 leading-normal">
                                    <CalendarIcon title="dato"/>
                                    {formatEventTimes(event.event)}
                                </Detail>
                                    {formatEventDuration(event.event) !== "" && (
                                        <Detail className="flex gap-1 items-center pb-1 leading-normal">
                                            <ClockIcon aria-hidden/>
                                            Varighet: {formatEventDuration(event.event)}
                                        </Detail>
                                    )}</>)}
                            {event.event.location.length <= 50 && (
                                <Detail className="leading-normal">
              <span className="flex items-center gap-1 pb-1">
                <LocationPinIcon title="lokasjon"/>
                  {event.event.location}
              </span>
                                </Detail>
                            )}
                            {event.event.signupDeadline && (
                                <Detail className="leading-normal">
              <span className="flex items-center gap-1 pb-1">
                <HourglassBottomFilledIcon title="timeglass"/>
                Påmeldingsfrist:{" "}
                  {now === null ? <Skeleton variant="text" className="w-full" /> : isUtløpt ? (
                      <span className="text-white bg-ax-danger-700 rounded px-2">
                    Utløpt
                  </span>
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
                  <PersonCheckmarkIcon title="person"/>
                    {now === null ? <Skeleton variant="text" className="w-full" /> : attendeeCount >= event.event.participantLimit ? (
                        <span className="bg-ax-danger-700 text-white rounded px-2">
                      Arrangementet er fullt
                    </span>
                    ) : (<>
                        {event.event.participantLimit - attendeeCount > 9 ? (
                            <>{attendeeCount} / {event.event.participantLimit} plasser</>):(<>Kun {event.event.participantLimit - attendeeCount} plasser igjen</>)}
                    </>)}

                </span>
                                    </Detail>
                                </>
                            )}
                            {event.event.participantLimit === 0 && (
                                <Detail className="leading-normal">
                <span className="flex items-center gap-1 pb-1 leading-normal">
                  <PersonCheckmarkIcon title="deltakere"/>
                  {event.participants.length} {event.participants.length === 1 ? "deltaker" : "deltakere"}
                </span>
                                </Detail>
                            )}
                        </div>
                        <div className="flex gap-2 flex-wrap items-end w-full">
                            {event.recurringSeries && (
                                <RecurringBadge frequency={event.recurringSeries.frequency} />
                            )}
                            {isRegistered && (
                                <Tag variant="success" size="small">Påmeldt</Tag>
                            )}
                            {categories.map((category) => (
                                <Tag variant="neutral" size="small" key={category.id}>
                                    {category.name}
                                </Tag>
                            ))}
                        </div>
                    </div>
                </Link>
    );
}
