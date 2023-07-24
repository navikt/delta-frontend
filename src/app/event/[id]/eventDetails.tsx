"use client";

import { Dispatch, SetStateAction, useState } from "react";
import { User } from "@/types/user";
import EventDescription from "./eventDescription";
import { Alert, Button, Heading, CopyButton } from "@navikt/ds-react";
import Link from "next/link";
import { nb } from "date-fns/locale";
import { DeltaEventWithParticipant, DeltaParticipant } from "@/types/event";
import { formatInTimeZone } from "date-fns-tz";
import { getEvent, joinEvent, leaveEvent } from "@/service/eventActions";
import ExportParticipants from "./exportParticipants";

export default function EventDetails({
  event,
  participants,
  user,
}: DeltaEventWithParticipant & {
  user: User;
}) {
  const [reactiveParticipants, setParticipants] = useState(participants);
  const isParticipant = reactiveParticipants
    .map((p) => p.email)
    .includes(user.email);

  const [showRegistration, setRegistration] = useState(false);
  const [showUnregistration, setUnregistration] = useState(false);

  const showAlert = () => {
    const setter = !isParticipant ? setRegistration : setUnregistration;
    setter(true);
    setTimeout(() => {
      setter(false);
    }, 2000);
  };

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
      <div className="flex w-full justify-between items-start gap-4">
        <div className="flex flex-col w-fit bg-red-100 p-2 rounded">
          <span>{month}</span>
          <span className="font-semibold text-3xl">{day}</span>
        </div>
        <div className="flex flex-col md:flex-row justify-between gap-4 items-end md:items-center">
          <div className="whitespace-nowrap">
            {showRegistration && (
              <Alert variant="success" size="small" className="p-3">
                Påmelding registrert
              </Alert>
            )}
            {showUnregistration && (
              <Alert variant="success" size="small" className="p-3">
                Avmelding registrert
              </Alert>
            )}
          </div>
          {event.ownerEmail === user.email ? (
            <>
              <Link
                className="w-full h-fit navds-button navds-button--primary whitespace-nowrap navds-label"
                href={`/event/${event.id}/edit`}
              >
                Rediger arrangement
              </Link>
              <ExportParticipants participants={participants} />
            </>
          ) : (
            <Button
              variant={isParticipant ? "danger" : "primary"}
              className="w-full h-fit"
              onClick={async () =>
                toggleEventStatus(event.id, isParticipant, (state) => {
                  showAlert();
                  setParticipants(state);
                })
              }
            >
              {isParticipant ? "Meld av" : "Bli med"}
            </Button>
          )}
          <CopyButton
            className="navds-button navds-button--secondary md:whitespace-nowrap w-full"
            copyText={`https://${window.location.hostname}/event/${event.id}`}
            text="Kopier link"
          />
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

async function toggleEventStatus(
  eventId: string,
  isParticipant: boolean,
  setParticipants: Dispatch<SetStateAction<DeltaParticipant[]>>,
) {
  await (isParticipant ? leaveEvent(eventId) : joinEvent(eventId));
  setParticipants((await getEvent(eventId)).participants);
}
