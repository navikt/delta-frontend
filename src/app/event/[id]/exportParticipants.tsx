"use client";
import { DeltaParticipant } from "@/types/event";
import { ChevronDownIcon, EnvelopeClosedIcon } from "@navikt/aksel-icons";
import { Button, CopyButton, Dropdown, Link } from "@navikt/ds-react";

type ExportParticipantsProps = { participants: DeltaParticipant[] };

export default function ExportParticipants(
  participants: ExportParticipantsProps,
) {
  const copyEmails = participants.participants.map((p) => p.email).join(";");
  const sendEmails = participants.participants.map((p) => p.email).join(", ");

  return (
    <Dropdown>
      <Button as={Dropdown.Toggle} variant="secondary" className="w-full">
        <span className="flex flex-row gap-1 whitespace-nowrap items-center">
          Eksporter <ChevronDownIcon className="h-6 w-6" />
        </span>
      </Button>
      <Dropdown.Menu>
        <Dropdown.Menu.List>
          <CopyButton copyText={copyEmails} text="Kopier alle eposter" />
          <Dropdown.Menu.List.Item as={Link} href={`mailto:${sendEmails}`}>
            <EnvelopeClosedIcon /> Send e-post til deltakere
          </Dropdown.Menu.List.Item>
        </Dropdown.Menu.List>
      </Dropdown.Menu>
    </Dropdown>
  );
}
