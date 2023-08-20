"use client";
import { FullDeltaEvent } from "@/types/event";
import { BodyLong, Button, Heading, Modal } from "@navikt/ds-react";
import ParticipantTable from "./participantTable";
import ExportParticipants from "../exportParticipants";
import Link from "next/link";
import { deleteEvent } from "@/service/eventActions";
import { useEffect, useState } from "react";
import { TrashIcon } from "@navikt/aksel-icons";
import { User } from "@/types/user";

type ParticipantPageProps = {
  fullEvent: FullDeltaEvent;
  user: User;
};

export default function AdminPage({
  fullEvent: eventWithParticipants,
  user,
}: ParticipantPageProps) {
  const [openConfirmation, setOpenConfirmation] = useState(false);

  const { event, participants, hosts }: FullDeltaEvent = eventWithParticipants;
  return (
    <div className="flex flex-col gap-10">
      <span className="w-full flex flex-row justify-end">
        <span className="flex w-full md:w-fit flex-col md:flex-row gap-4">
          <Link
            href={`/event/${event.id}/edit`}
            className="w-full h-fit navds-button navds-button--primary whitespace-nowrap navds-label"
          >
            Rediger arrangement
          </Link>
          <Link
            href={`/event/new?template=${event.id}`}
            className="w-full h-fit navds-button navds-button--primary-neutral whitespace-nowrap navds-label"
          >
            Bruk som mal
          </Link>
          <ExportParticipants participants={participants} />
          <Button
            type="submit"
            variant="danger"
            className="w-full h-fit font-bold"
            onClick={() => setOpenConfirmation((x) => !x)}
          >
            <span className="flex items-center gap-1">
              <TrashIcon /> Slett
            </span>
          </Button>
        </span>
      </span>
      <Modal
        open={openConfirmation}
        aria-label="Slett arrangement modal"
        aria-labelledby="Slett arrangement modal"
        className="w-4/5 max-w-[30rem] max-h-[50rem]"
      >
        <Modal.Body>
          <Heading spacing level="1" size="large" id="modal-heading">
            {`Slett: "${event?.title}?"`}
          </Heading>
          <BodyLong spacing>
            {`Er du sikker på at du vil slette "${event?.title}"? Dette kan ikke angres.`}
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
              variant="danger"
              className="w-fit h-fit font-bold"
              onClick={() => deleteAndRedirect(event?.id!!)}
            >
              Ja, jeg vil slette arrangementet
            </Button>
        </Modal.Footer>
      </Modal>
      <ParticipantTable
        participants={participants}
        hosts={hosts}
        event={event}
        user={user}
      />
    </div>
  );
}

async function deleteAndRedirect(eventId: string) {
  await deleteEvent(eventId);
  window.location.href = "/";
}
