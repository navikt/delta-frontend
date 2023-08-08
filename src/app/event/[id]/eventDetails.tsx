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
import { InformationSquareFillIcon } from "@navikt/aksel-icons";

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
    const setter = !isParticipant ? setRegistration : setUnregistration;
    setter(true);
    setTimeout(() => {
      setter(false);
    }, 2000);
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
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center md:whitespace-nowrap">
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
              event.participantLimit <= participants.length &&
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
                // disabled={event.participantLimit == participants.length} // TODO: needs an UI element explaining why the button is disabled
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
            aria-labelledby={isParticipant ? "Meld av modal" : "Bli med modal"}
            className="w-4/5 max-w-[30rem] max-h-[50rem]"
          >
            <Modal.Content>
              <Heading spacing level="1" size="large" id="modal-heading">
                {isParticipant ? "Meld av" : "Bli med"}
              </Heading>
              <BodyLong spacing>
                {isParticipant
                  ? `Er du sikker på at du vil melde deg av? Dersom påmeldignsfristen er utløpt \
eller antallsbegrensing er nådd, kan du ikke melde deg på igjen.`
                  : `Ved å melde deg på arrangementet, godtar du at Delta lagrer ditt navn og e-postadresse.`}
              </BodyLong>
              <div className="flex flex-row justify-end gap-4">
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
              </div>
            </Modal.Content>
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
        <div className="flex-grow flex flex-col gap-2 md:w-3/4">
          <Heading size="medium" as="h2">
            Detaljer
          </Heading>
          <BodyLong className="italic whitespace-pre-line">
            {event.description}
          </BodyLong>
          <div className="flex gap-2 flex-wrap">
            {categories.length &&
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
