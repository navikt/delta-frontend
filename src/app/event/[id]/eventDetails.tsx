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
  Tag,
} from "@navikt/ds-react";
import Link from "next/link";
import { FullDeltaEvent, DeltaParticipant } from "@/types/event";
import { getEvent, joinEvent, leaveEvent } from "@/service/eventActions";
import { format } from "date-fns";
import Calendar from "@/components/calendar";

export default function EventDetails({
  event,
  participants,
  hosts,
  categories,
  user,
  hostname,
}: FullDeltaEvent & {
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
    setUnregistration(false)
    setRegistration(false)
    const setter = !isParticipant ? setRegistration : setUnregistration;
    setter(true);
  };

  const isSameDay =
    format(new Date(event.startTime), "MMMd") ===
    format(new Date(event.endTime), "MMMd");

  return (
    <div>
      <div className="flex w-full justify-between items-start gap-4">
        {isSameDay ? (
          <Calendar dateString={event.startTime} displayTime={!isSameDay} />
        ) : (
          <div className="flex gap-2 items-center">
            <Calendar dateString={event.startTime} displayTime={!isSameDay} />
            ⁠–
            <Calendar dateString={event.endTime} displayTime={!isSameDay} />
          </div>
        )}
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
            if (hosts.map((h) => h.email).includes(user.email)) {
              return (
                <>
                  <Link
                    className="w-full h-fit navds-button navds-button--primary navds-label"
                    href={`/event/${event.id}/admin`}
                  >
                    Administrer
                  </Link>
                </>
              );
            }
            if (new Date(event.endTime) < new Date())
              return (
                <Alert
                  variant="info"
                  size="small"
                  className="md:whitespace-nowrap"
                >
                  Arrangementet er avsluttet
                </Alert>
              );

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
            if (
              event.participantLimit &&
              event.participantLimit <= hosts.length + participants.length &&
              !isParticipant
            ) {
              return (
                <Alert
                  variant="warning"
                  size="small"
                  className="md:whitespace-nowrap"
                >
                  Arrangementet er fullt
                </Alert>
              );
            }
            return (
              <Button
                variant={isParticipant ? "danger" : "primary"}
                className="w-full h-fit"
                onClick={() => setOpenConfirmation((x) => !x)}
              >
                {isParticipant ? "Meld av" : "Bli med"}
              </Button>
            );
          })()}
          <Modal
            open={openConfirmation}
            aria-label="Meld av modal"
            aria-labelledby={isParticipant ? "Meld av modal" : "Bli med modal"}
          >
            <Modal.Body>
              <Heading spacing level="1" size="large" id="modal-heading">
                {isParticipant ? "Meld av" : "Bli med"}
              </Heading>
              <BodyLong spacing>
                {isParticipant
                  ? `Er du sikker på at du vil melde deg av? Dersom påmeldingsfristen er utløpt \
eller antallsbegrensing er nådd, kan du ikke melde deg på igjen.`
                  : `Ved å melde deg på arrangementet, godtar du at Delta lagrer ditt navn og din e-postadresse.`}
              </BodyLong>
              </Modal.Body>
              <Modal.Footer>
                <Button
                  variant="secondary"
                  onClick={async () => setOpenConfirmation((x) => !x)}
                >
                  Avbryt
                </Button>
                <Button
                  variant={isParticipant ? "danger" : "primary"}
                  className="w-fit h-fit font-bold"
                  onClick={() =>
                    toggleEventStatus(event.id, isParticipant, (state) => {
                      showAlert();
                      setParticipants(state);
                      setOpenConfirmation((x) => !x);
                    })
                  }
                >
                  {isParticipant ? "Ja, meld meg av" : "Godta og bli med"}
                </Button>
              </Modal.Footer>
          </Modal>
          <CopyButton
            className="navds-button navds-button--secondary md:whitespace-nowrap w-full"
            copyText={`${hostname}/event/${event.id}`}
            text="Kopier lenke"
          />
        </div>
      </div>
      <div className="flex-col md:flex-row flex justify-between gap-4 md:gap-28 pt-4">
        <EventDescription
          event={event}
          participants={reactiveParticipants}
          hosts={hosts}
          categories={categories}
          displayTime={isSameDay}
          className="flex flex-col gap-2 w-fit"
        />
        <div className="flex-grow flex flex-col gap-2 md:w-2/4">
          <Heading size="medium" as="h2">
            Detaljer
          </Heading>
          <BodyLong className="whitespace-pre-line break-words max-w-prose">
            {event.description}
          </BodyLong>
          <div className="flex gap-2 flex-wrap mt-6 mb-6">
            {categories.length > 0 &&
              categories.map((category) => (
                <Tag variant="alt1" key={category.id}>
                  {category.name}
                </Tag>
              ))}
          </div>
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
