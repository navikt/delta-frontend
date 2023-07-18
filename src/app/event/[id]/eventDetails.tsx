"use client";

import { format } from "date-fns";
import { useState } from "react";
import { dates } from "@/components/format";
import { User } from "@/types/user";
import JoinEventButton from "./joinEventButton";
import DeleteEventButton from "./deleteEventButton";
import EventDescription from "./eventDescription";
import { Heading } from "@navikt/ds-react";
import { nb } from "date-fns/locale";
import { DeltaEventWithParticipant } from "@/types/event";

export default function EventDetails({
  event,
  participants,
  user,
}: DeltaEventWithParticipant & {
  user: User;
}) {
  const [reactiveParticipants, setParticipants] = useState(participants);
  const [start, _] = dates(event);

  return (
  <div>
      <div className="flex flex-row w-full justify-between items-start">
        <div className="flex flex-col w-fit bg-red-100 p-2 rounded">
          <span>
            {format(start, "MMMM", { locale: nb }).slice(0, 3).toUpperCase()}
          </span>
          <span className="font-semibold text-3xl">{format(start, "d")}</span>
        </div>
        <div className="flex flex-row gap-4 items-center">
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
