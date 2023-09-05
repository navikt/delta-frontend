"use client";

import "./eventCard.css";
import {Category, FullDeltaEvent} from "@/types/event";
import {format} from "date-fns";
import {Detail, Heading, LinkPanel, Tag} from "@navikt/ds-react";
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
    formatEventDates,
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
            <Heading level="2" size="small">{event.event.title}</Heading>
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
                    {event.event.signupDeadline && (
                        <Detail className="leading-normal">
              <span className="flex items-center gap-1 pb-1">
                <HourglassBottomFilledIcon title="timeglass"/>
                Påmeldingsfrist:{" "}
                  {isUtløpt ? (
                      <span className="text-white bg-red-600 rounded px-2">
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
                    {/*Maks {event.participants.length + event.hosts.length} av*/}
                    {event.participants.length + event.hosts.length >=
                    event.event.participantLimit ? (
                        <span className="bg-red-600 text-white rounded px-2">
                      Arrangementet er fullt
                    </span>
                    ) : (<>
                         {event.event.participantLimit > 9 ? (
                             <>Maks {event.event.participantLimit} deltakere</>):(<>{event.event.participantLimit - event.participants.length - event.hosts.length} plasser igjen</>)}
                    </>)}

                </span>
                            </Detail>
                        </>
                    )}
                </div>
                <div className="flex gap-2 flex-wrap items-end w-full">
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
