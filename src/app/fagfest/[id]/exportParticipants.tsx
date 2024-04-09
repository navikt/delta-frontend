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
          <CopyButton
            className="w-full justify-start px-2"
            size="small"
            copyText={copyEmails}
            text="Kopier alle e-postadresser"
          />
          <Dropdown.Menu.List.Item
            className={`
              navds-copybutton--small navds-copybutton--neutral
              no-underline text-text-subtle hover:text-text-default
              hover:bg-surface-hover w-full justify-start px-2
            `}
            as={Link}
            href={`mailto:${sendEmails}`}
          >
            <span className="navds-copybutton__content">
              <EnvelopeClosedIcon className="navds-copybutton__icon" />
              <span className="navds-label navds-label--small">
                Send e-post til deltakere
              </span>
            </span>
          </Dropdown.Menu.List.Item>
        </Dropdown.Menu.List>
      </Dropdown.Menu>
    </Dropdown>
  );
}
