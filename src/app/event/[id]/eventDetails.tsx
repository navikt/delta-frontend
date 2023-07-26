"use client";

import { Dispatch, SetStateAction, useState } from "react";
import { User } from "@/types/user";
import EventDescription from "./eventDescription";
import {
  Alert,
  Button,
  Heading,
  CopyButton,
  Modal,
  BodyLong,
} from "@navikt/ds-react";
import Link from "next/link";
import { nb } from "date-fns/locale";
import { DeltaEventWithParticipant, DeltaParticipant } from "@/types/event";
import { getEvent, joinEvent, leaveEvent } from "@/service/eventActions";
import { formatDeadline } from "@/service/format";
import { format } from "date-fns";
import { HourglassBottomFilledIcon } from "@navikt/aksel-icons";

export default function EventDetails({
  event,
  participants,
  user,
  hostname,
}: DeltaEventWithParticipant & {
  user: User;
  hostname?: string;
}) {
  const [reactiveParticipants, setParticipants] = useState(participants);
  const isParticipant = reactiveParticipants
    .map((p) => p.email)
    .includes(user.email);

  const [showRegistration, setRegistration] = useState(false);
  const [showUnregistration, setUnregistration] = useState(false);
  const [openConfirmation, setOpenConfirmation] = useState(false);

  const showAlert = () => {
    const setter = !isParticipant ? setRegistration : setUnregistration;
    setter(true);
    setTimeout(() => {
      setter(false);
    }, 2000);
  };

  const month = format(new Date(event.startTime), "MMM", { locale: nb })
    .substring(0, 3)
    .toUpperCase();
  const day = format(new Date(event.startTime), "d");

  return (
    <div>
      <div className="flex w-full justify-between items-start gap-4">
        <div className="flex flex-col w-fit rounded border border-border-default">
          <span className="bg-red-600 text-white px-2">{month}</span>
          <span className="font-semibold text-3xl px-2">{day}</span>
        </div>
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
          {showRegistration && (
            <Alert variant="success" size="small">
              Påmelding registrert
            </Alert>
          )}
          {showUnregistration && (
            <Alert variant="success" size="small">
              Avmelding registrert
            </Alert>
          )}
          {(function () {
            if (event.ownerEmail === user.email) {
              return (
                <>
                  <Link
                    className="w-full h-fit navds-button navds-button--primary whitespace-nowrap navds-label"
                    href={`/event/${event.id}/edit`}
                  >
                    Rediger arrangement
                  </Link>
                </>
              );
            }
            // If det har vært -> tidlig retur
            if (new Date(event.endTime) < new Date()) return <></>;

            const isUtløpt =
              !isParticipant &&
              !!event.signupDeadline &&
              new Date(event.signupDeadline) < new Date()
                ? true
                : false;
            if (isUtløpt) {
              return (
                <Alert
                  variant="warning"
                  size="small"
                  className="md:whitespace-nowrap"
                >
                  Påmeldingsfristen er utløpt
                </Alert>
              );
            }
            return (
              <Button
                variant={isParticipant ? "danger" : "primary"}
                className="w-full h-fit"
                onClick={() =>
                  isParticipant
                    ? setOpenConfirmation((x) => !x)
                    : toggleEventStatus(event.id, isParticipant, (state) => {
                        showAlert();
                        setParticipants(state);
                      })
                }
              >
                {isParticipant ? "Meld av" : "Bli med"}
              </Button>
            );
          })()}
          <Modal
            open={openConfirmation}
            aria-label="Meld av modal"
            onClose={() => setOpenConfirmation((x) => !x)}
            closeButton={false}
            aria-labelledby="Meld av modal"
            className="w-4/5 max-w-[30rem] max-h-[50rem]"
          >
            <Modal.Content>
              <Heading spacing level="1" size="large" id="modal-heading">
                {`Meld av?`}
              </Heading>
              <BodyLong spacing>
                {`Er du sikker på at du vil melde deg av ${event.title}? Dersom påmeldignsfristen er utløpt 
                eller antallsbegrensing er nådd, kan du ikke melde deg på igjen.`}
              </BodyLong>
              <div className="flex flex-row justify-end gap-4">
                <Button
                  variant="secondary"
                  onClick={async () => setOpenConfirmation((x) => !x)}
                >
                  Avbryt
                </Button>
                <Button
                  variant="danger"
                  className="w-fit h-fit font-bold"
                  onClick={() =>
                    toggleEventStatus(event.id, isParticipant, (state) => {
                      showAlert();
                      setParticipants(state);
                      setOpenConfirmation((x) => !x);
                    })
                  }
                >
                  Ja, meld meg av
                </Button>
              </div>
            </Modal.Content>
          </Modal>
          <CopyButton
            className="navds-button navds-button--secondary md:whitespace-nowrap w-full"
            copyText={`${hostname}/event/${event.id}`}
            text="Kopier link"
          />
        </div>
      </div>
      <div className="flex-col md:flex-row flex justify-between gap-4 md:gap-28 pt-4">
        <EventDescription event={event} participants={reactiveParticipants} />
        <div className="flex-grow flex flex-col gap-2 md:w-3/4">
          <Heading size="medium">Detaljer:</Heading>
          {event.signupDeadline && (
            <div className="flex flex-col md:items-center gap-2 md:flex-row">
              Påmeldingsfrist:
              <span className="flex text-red-500 items-center gap-2">
                {formatDeadline(event)}
                <HourglassBottomFilledIcon />
              </span>
            </div>
          )}
          <p className="italic whitespace-pre-line">{event.description}</p>
          <span className="flex flex-col md:flex-row md:gap-2 md:items-center">
            Kontaktperson:
            <Link href={`mailto:${event.ownerEmail}`}>{event.ownerEmail}</Link>
          </span>
        </div>
      </div>
    </div>
  );
}

async function toggleEventStatus(
  eventId: string,
  isParticipant: boolean,
  setParticipants: Dispatch<SetStateAction<DeltaParticipant[]>>
) {
  await (isParticipant ? leaveEvent(eventId) : joinEvent(eventId));
  setParticipants((await getEvent(eventId)).participants);
}
