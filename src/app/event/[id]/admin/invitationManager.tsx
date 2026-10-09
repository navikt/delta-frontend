"use client";

import { Alert, BodyShort, Button, Heading, Tag } from "@navikt/ds-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import PersonPicker from "@/components/personPicker";
import { invitePeople, revokeInvitation } from "@/service/eventActions";
import { DirectoryPerson, FullDeltaEvent, InvitationStatus } from "@/types/event";

type InvitationManagerProps = {
  event: FullDeltaEvent;
  peopleSearchEnabled: boolean;
};

const statusLabels: Record<InvitationStatus, string> = {
  INVITED: "Venter på svar",
  REGISTERED: "Påmeldt",
  DECLINED: "Har takket nei",
  FORWARDED: "Via videresending",
};

const statusColors: Record<InvitationStatus, "neutral" | "success" | "warning" | "info"> = {
  INVITED: "neutral",
  REGISTERED: "success",
  DECLINED: "warning",
  FORWARDED: "info",
};

export default function InvitationManager({
  event: initialEvent,
  peopleSearchEnabled,
}: InvitationManagerProps) {
  const router = useRouter();
  const [event, setEvent] = useState(initialEvent);
  const [selectedPeople, setSelectedPeople] = useState<DirectoryPerson[]>([]);
  const [actionError, setActionError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  if (event.event.inviteMode !== "SHARED" || event.recurringSeries) return null;

  const invitations = event.invited ?? [];
  const excludedEmails = [
    ...event.participants.map((person) => person.email),
    ...event.hosts.map((person) => person.email),
    ...invitations.map((person) => person.email),
  ];

  return (
    <section className="flex flex-col gap-4">
      <div>
        <Heading level="2" size="medium">Inviterte</Heading>
        <BodyShort size="small">
          Invitasjoner reserverer plass fram til påmeldingsfristen. Inviterte får en Outlook-invitasjon fra ikkesvar.delta@nav.no.
        </BodyShort>
      </div>
      {invitations.length > 0 ? (
        <ul className="flex flex-col gap-3">
          {invitations.map((invitation) => (
            <li
              key={invitation.email}
              className="flex flex-wrap items-center justify-between gap-3"
            >
              <span>
                <strong>{invitation.name}</strong>{" "}
                <span className="text-ax-text-neutral-subtle">({invitation.email})</span>
              </span>
              <div className="flex items-center gap-2">
                <Tag
                  variant="moderate"
                  data-color={statusColors[invitation.status]}
                  size="small"
                >
                  {statusLabels[invitation.status]}
                </Tag>
                {invitation.status !== "REGISTERED" && (
                  <Button
                    type="button"
                    size="small"
                    variant="tertiary"
                    data-color="danger"
                    onClick={async () => {
                      setActionError(null);
                      const result = await revokeInvitation(event.event.id, invitation.email);
                      if (result.ok) {
                        setEvent(result.data);
                        router.refresh();
                      } else {
                        setActionError(result.message);
                      }
                    }}
                  >
                    Trekk tilbake
                  </Button>
                )}
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <BodyShort>Ingen inviterte ennå.</BodyShort>
      )}
      {peopleSearchEnabled ? (
        <>
          <PersonPicker
            selectedPeople={selectedPeople}
            onChange={setSelectedPeople}
            excludedEmails={excludedEmails}
          />
          <Button
            type="button"
            className="w-fit"
            disabled={!selectedPeople.length || saving}
            loading={saving}
            onClick={async () => {
              setSaving(true);
              setActionError(null);
              const result = await invitePeople(
                event.event.id,
                selectedPeople.map(({ email }) => ({ email })),
              );
              if (result.ok) {
                setEvent(result.data);
                setSelectedPeople([]);
                router.refresh();
              } else {
                setActionError(result.message);
              }
              setSaving(false);
            }}
          >
            Send invitasjon
          </Button>
        </>
      ) : (
        <BodyShort>Personsøk er ikke tilgjengelig for deg nå.</BodyShort>
      )}
      {actionError && <Alert variant="error" role="alert">{actionError}</Alert>}
    </section>
  );
}
