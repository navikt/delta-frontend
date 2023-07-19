"use client";

import { useState } from "react";
import { User } from "@/types/user";
import JoinEventButton from "./joinEventButton";
import DeleteEventButton from "./deleteEventButton";
import EventDescription from "./eventDescription";
import { Heading } from "@navikt/ds-react";
import { nb } from "date-fns/locale";
import { DeltaEventWithParticipant } from "@/types/event";
import { formatInTimeZone } from "date-fns-tz";

export default function EventDetails({
  event,
  participants,
  user,
}: DeltaEventWithParticipant & {
  user: User;
}) {
  const [reactiveParticipants, setParticipants] = useState(participants);
  const month = formatInTimeZone(
    new Date(event.startTime),
    "Europe/Oslo",
    "MMM",
    { locale: nb },
  )
    .substring(0, 3)
    .toUpperCase();
  const day = formatInTimeZone(new Date(event.startTime), "Europe/Oslo", "d");

  return (
    <div>
      <div className="flex flex-col md:flex-row w-full justify-between items-start gap-4">
        <div className="flex flex-col w-fit bg-red-100 p-2 rounded">
          <span>{month}</span>
          <span className="font-semibold text-3xl">{day}</span>
        </div>
        <div className="flex flex-col md:flex-row gap-4 items-center">
          <JoinEventButton
            event={event}
            user={user}
            participants={reactiveParticipants}
            setParticipants={setParticipants}
          />
          {
            // TODO: This looks horrible on mobile. This should ideally be located somewhere else
            event.ownerEmail === user.email && (
              <DeleteEventButton event={event} />
            )
          }
        </div>
      </div>
      <div className="flex-col md:flex-row flex justify-between gap-4 md:gap-28 pt-4">
        <EventDescription event={event} participants={reactiveParticipants} />
        <div className="flex-grow flex flex-col gap-2">
          <Heading size="medium">Detaljer:</Heading>
          <p className="italic whitespace-pre-line">{event.description}</p>
        </div>
      </div>
    </div>
  );
}
