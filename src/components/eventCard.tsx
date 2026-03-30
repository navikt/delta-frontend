"use client";
import "./eventCard.css";
import {Category, FullDeltaEvent} from "@/types/event";
import {format} from "date-fns";
import {Detail, Heading, Tag} from "@navikt/ds-react";
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
import { RecurringBadge } from "@/components/RecurringBadge";
import { usePathname, useSearchParams } from "next/navigation";

export function EventCard({
                              event,
                              categories,
                              showAll,
                              tabname,
                              userEmail,
                           }: {
    event: FullDeltaEvent;
    categories: Category[];
    showAll?: string[];
    tabname?: string;
    userEmail?: string;
}) {
    const isRegistered =
        userEmail != null && event.participants.some((p) => p.email === userEmail);
    const isUtløpt =
        !!event.event.signupDeadline &&
        new Date(event.event.signupDeadline) < new Date()
            ? true
            : false;
    const pathname = usePathname();
    const searchParams = useSearchParams();

    // Check if the tab is "alle" and the event has a category named "fagfestival"
    const shouldHide = tabname === "alle" && event.categories.some(category =>
        category.name === "fagfestival" || category.name === "fagdag_utvikling_og_data"
    );

    // If the condition is true, do not render the event
    if (shouldHide) {
        return null;
    }

    const currentSearch = searchParams.toString();
    const returnTo = `${pathname}${currentSearch ? `?${currentSearch}` : ""}`;
    const href = `/event/${event.event.id}?returnTo=${encodeURIComponent(returnTo)}`;

    const handleNavigation = () => {
        sessionStorage.setItem(`event-overview-scroll:${returnTo}`, `${window.scrollY}`);
    };

    return (
        <>
            {isUtløpt && tabname == "alle" && !showAll?.includes("10") ? (
                <></>
            ) : (
                <Link
                    href={href}
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
                            {format(new Date(event.event.startTime), "MMMd") ===
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
                  {isUtløpt ? (
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
                    {event.participants.length + event.hosts.length >=
                    event.event.participantLimit ? (
                        <span className="bg-ax-danger-700 text-white rounded px-2">
                      Arrangementet er fullt
                    </span>
                    ) : (<>
                        {event.event.participantLimit - event.participants.length - event.hosts.length > 9 ? (
                            <>{event.participants.length} / {event.event.participantLimit} deltakere</>):(<>Kun {event.event.participantLimit - event.participants.length - event.hosts.length} plasser igjen</>)}
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
            )}
        </>
    );
}
