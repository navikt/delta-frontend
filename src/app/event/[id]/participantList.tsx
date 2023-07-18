"use client";
import { DeltaParticipant } from "@/types/event";
import Participant from "@/app/event/[id]/participant";
import { BodyLong, Button, Heading, Modal } from "@navikt/ds-react";
import { useEffect, useState } from "react";

type ParticipantListProps = {
  participants: DeltaParticipant[];
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
};

export default function ParticipantList({
  participants,
  open,
  setOpen,
}: ParticipantListProps) {
  useEffect(() => {
    Modal.setAppElement("#main");
  }, []);
  return (
    <>
      <Modal
        className="w-4/5 max-w-[30rem] max-h-[50rem]"
        open={open}
        aria-label="deltakere"
        onClose={() => setOpen(false)}
        aria-labelledby="modal-heading"
      >
        <Modal.Content>
          <Heading spacing level="1" size="large" id="modal-heading">
            Deltakere
          </Heading>
          <div className="flex flex-col gap-2">
            {participants.map((p) => (
              <Participant {...p} />
            ))}
          </div>
        </Modal.Content>
      </Modal>
    </>
  );
}

/*
 return (
    <div className="flex flex-col gap-2">
      {participants.map((p) => (
        <Participant {...p} />
      ))}
    </div>
  );
}
*/
