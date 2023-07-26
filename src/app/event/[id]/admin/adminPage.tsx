"use client";
import { DeltaEventWithParticipant } from "@/types/event";
import { BodyLong, Button, Heading, Modal } from "@navikt/ds-react";
import ParticipantTable from "./participantTable";
import ExportParticipants from "../exportParticipants";
import Link from "next/link";
import { deleteEvent } from "@/service/eventActions";
import { useEffect, useState } from "react";
import { TrashIcon } from "@navikt/aksel-icons";

type ParticipantPageProps = {
  eventWithParticipants: DeltaEventWithParticipant;
};

export default function AdminPage({
  eventWithParticipants,
}: ParticipantPageProps) {
  const [openConfirmation, setOpenConfirmation] = useState(false);
  useEffect(() => {
    Modal.setAppElement("#main");
  }, []);

  const { event, participants }: DeltaEventWithParticipant =
    eventWithParticipants;
  return (
    <div className="flex flex-col min-h-screen py-2 gap-10">
      <span className="flex flex-row justify-end">
        <span className="flex flex-row gap-4">
          <Link
            href={`/event/${event.id}/edit`}
            className="w-full h-fit navds-button navds-button--primary whitespace-nowrap navds-label"
          >
            Rediger arrangement
          </Link>
          <ExportParticipants participants={participants} />
          <Button
            type="submit"
            variant="danger"
            className="w-fit h-fit font-bold"
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
        onClose={() => setOpenConfirmation((x) => !x)}
        closeButton={false}
        aria-labelledby="Slett arrangement modal"
        className="w-4/5 max-w-[30rem] max-h-[50rem]"
      >
        <Modal.Content>
          <Heading spacing level="1" size="large" id="modal-heading">
            {`Slett ${event?.title}?`}
          </Heading>
          <BodyLong spacing>
            {`Er du sikker på at du vil slette ${event?.title}? Dette kan ikke angres.`}
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
              onClick={() => deleteAndRedirect(event?.id!!)}
            >
              Ja, jeg vil slette arrangementet
            </Button>
          </div>
        </Modal.Content>
      </Modal>
      <ParticipantTable participants={participants} event={event} />
    </div>
  );
}

async function deleteAndRedirect(eventId: string) {
  await deleteEvent(eventId);
  window.location.href = "/";
}
