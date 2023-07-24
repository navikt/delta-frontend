"use client";
import { DeltaParticipant } from "@/types/event";
import { ChevronDownIcon, EnvelopeClosedIcon } from "@navikt/aksel-icons";
import { Button, CopyButton, Dropdown } from "@navikt/ds-react";
import Link from "next/link";

type ExportParticipantsProps = { participants: DeltaParticipant[] };

export default function ExportParticipants(
  participants: ExportParticipantsProps,
) {
  const copyEmails = participants.participants.map((p) => p.email).join(";");
  const sendEmails = participants.participants.map((p) => p.email).join(", ");

  return (
    <div className="min-h-32">
      <Dropdown>
        <Button as={Dropdown.Toggle} variant="secondary">
          <span className="flex flex-row gap-1 whitespace-nowrap">
            Eksporter deltakere <ChevronDownIcon />
          </span>
        </Button>
        <Dropdown.Menu>
          <Dropdown.Menu.List>
            <Dropdown.Menu.List.Item as={Link} href={`mailto:${sendEmails}`}>
              <EnvelopeClosedIcon /> Send e-post til deltakere
            </Dropdown.Menu.List.Item>
            <CopyButton copyText={copyEmails} text="Kopier alle eposter" />
          </Dropdown.Menu.List>
        </Dropdown.Menu>
      </Dropdown>
    </div>
  );
}
