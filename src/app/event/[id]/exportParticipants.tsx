"use client";
import { DeltaParticipant } from "@/types/event";
import { Button, Dropdown } from "@navikt/ds-react";
import Link from "next/link";

type ExportParticipantsProps = { participants: DeltaParticipant[] };

export default function ExportParticipants(
  participants: ExportParticipantsProps
) {
  const emails = participants.participants.map((p) => p.email);
  console.log(emails);

  return (
    <div className="min-h-32">
      <Dropdown>
        <Button as={Dropdown.Toggle}>Toggle</Button>
        <Dropdown.Menu>
          <Dropdown.Menu.List>
            <Dropdown.Menu.List.Item as={Link} href="https://nav.no">
              hei
            </Dropdown.Menu.List.Item>
            <Dropdown.Menu.List.Item
              as={Link}
              href="https://nav.no"
              target="_blank"
            >
              Hjelp (åpner i en ny fane)
            </Dropdown.Menu.List.Item>
          </Dropdown.Menu.List>
        </Dropdown.Menu>
      </Dropdown>
    </div>
  );
}
