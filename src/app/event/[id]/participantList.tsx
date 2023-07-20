"use client";
import { DeltaParticipant } from "@/types/event";
import Participant from "@/app/event/[id]/participant";
import { Heading, Modal } from "@navikt/ds-react";
import { useEffect } from "react";
import { FileExportIcon } from "@navikt/aksel-icons";

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
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              {participants.map((p) => (
                <Participant {...p} key={p.email} />
              ))}
            </div>
            <div>
              <FileExportIcon title="a11y-title" />
            </div>
          </div>
        </Modal.Content>
      </Modal>
    </>
  );
}

